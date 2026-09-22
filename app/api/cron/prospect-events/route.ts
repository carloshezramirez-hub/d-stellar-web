import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron-auth";
import { getEventLeadsDb } from "@/lib/event-leads-db";
import { TARGET_CATEGORIES } from "@/lib/prospecting/targets";
import { textSearchNearby } from "@/lib/prospecting/places";
import { filterWalkable } from "@/lib/prospecting/walking-distance";
import { extractContactInfo } from "@/lib/prospecting/enrich-contact";
import { buildEventProspectDossier } from "@/lib/ai/private-event-dossier";
import { generateEventOutreachPlan, CONFIDENCE_GATE } from "@/lib/ai/private-event-research-agent";

export const dynamic = "force-dynamic";

const MAX_NEW_PER_RUN = 15;

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  const supabase = getEventLeadsDb();
  let inserted = 0;
  let skippedNoWebsite = 0;
  let skippedNoEmail = 0;
  let skippedDuplicate = 0;

  for (const { category, segment } of TARGET_CATEGORIES) {
    if (inserted >= MAX_NEW_PER_RUN) break;

    const places = await textSearchNearby(category);
    const withWebsite = places.filter((p) => p.websiteUri);
    skippedNoWebsite += places.length - withWebsite.length;

    const walkable = await filterWalkable(withWebsite);

    for (const { place, walkingDistanceM, walkingDurationMin } of walkable) {
      if (inserted >= MAX_NEW_PER_RUN) break;

      const { email, contactName } = await extractContactInfo(place.websiteUri!);

      const baseRow = {
        place_id: place.placeId,
        business_name: place.name,
        category,
        segment,
        formatted_address: place.formattedAddress,
        lat: place.lat,
        lng: place.lng,
        website: place.websiteUri,
        phone: place.phone,
        walking_distance_m: walkingDistanceM,
        walking_duration_min: walkingDurationMin,
        rating: place.rating,
        review_count: place.userRatingCount,
        contact_email: email,
        contact_name: contactName,
        status: email ? "prospected" : "skipped_no_email",
      };

      const { data, error } = await supabase
        .from("event_leads")
        .upsert(baseRow, { onConflict: "place_id", ignoreDuplicates: true })
        .select("id");

      if (error) {
        console.error(`[cron/prospect-events] insert ${place.name}:`, error.message);
        continue;
      }

      if (!data || data.length === 0) {
        skippedDuplicate++;
        continue;
      }

      const leadId = data[0].id as string;

      if (!email) {
        skippedNoEmail++;
        continue;
      }

      inserted++;

      const dossier = buildEventProspectDossier({
        business_name: place.name,
        category,
        segment,
        formatted_address: place.formattedAddress,
        walking_distance_m: walkingDistanceM,
        walking_duration_min: walkingDurationMin,
        contact_name: contactName,
      });
      const plan = await generateEventOutreachPlan(dossier);

      const gatePassed = Boolean(plan && plan.send && plan.confidence >= CONFIDENCE_GATE);

      await supabase
        .from("event_leads")
        .update({
          ai_subject: plan?.emailSubject ?? null,
          ai_body: plan?.emailBody ?? null,
          ai_evidence_line: plan?.evidenceLine ?? null,
          ai_what_we_checked: plan?.whatWeChecked ?? null,
          ai_confidence: plan?.confidence ?? null,
          ai_gate_passed: gatePassed,
          ai_generated_at: new Date().toISOString(),
          status: gatePassed ? "drafted" : "skipped_no_evidence",
        })
        .eq("id", leadId);
    }
  }

  return NextResponse.json({ inserted, skippedNoWebsite, skippedNoEmail, skippedDuplicate });
}
