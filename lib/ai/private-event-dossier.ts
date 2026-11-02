import type { EventLead } from "@/lib/event-leads-db";
import type { ReviewQuote, ReviewStats } from "@/lib/reviews-types";
import { BUSINESS } from "@/data/site";

/**
 * Dossier de hechos VERIFICADOS que recibe el research agent — nunca
 * inventados. A diferencia de stoutlab-outreach (donde la evidencia era
 * sobre las DEBILIDADES del prospecto), aquí el prospecto no tiene ninguna
 * debilidad que d-stellar resuelva: la evidencia real está en otro lado —
 * la distancia caminable verificada, la reputación real de d-stellar, y la
 * categoría real del propio prospecto.
 */
export interface EventProspectDossier {
  businessName: string;
  category: string;
  segment: "marca" | "corporativo" | "comunidad" | "particulares";
  address: string | null;
  walkingDistanceM: number;
  walkingDurationMin: number;
  contactName: string | null;
  // Hechos verificados sobre d-stellar mismo, para que el agente los cite
  // en vez de inventar credibilidad.
  dStellarAddress: string;
  dStellarRating: number;
  dStellarReviewCount: number;
  dStellarReviewQuote: string;
}

export function buildEventProspectDossier(
  lead: Pick<
    EventLead,
    "business_name" | "category" | "segment" | "formatted_address" | "walking_distance_m" | "walking_duration_min" | "contact_name"
  >,
  // Reseñas reales + su agregado — se piden una sola vez por corrida del
  // cron (ver app/api/cron/prospect-events/route.ts) en vez de que cada
  // dossier haga su propia consulta a Supabase.
  googleReviews: ReviewQuote[],
  googleReviewStats: ReviewStats,
): EventProspectDossier {
  // Cita real y corta, tomada del set curado de reseñas verdaderas (tabla
  // `reviews`) — puede venir vacío si Supabase no está configurado en este
  // entorno, a diferencia del antiguo data/reviews.ts que siempre tenía algo.
  const quotable = googleReviews.find((r) => r.quote.length <= 180) ?? googleReviews[0];

  return {
    businessName: lead.business_name,
    category: lead.category,
    segment: lead.segment as EventProspectDossier["segment"],
    address: lead.formatted_address,
    walkingDistanceM: lead.walking_distance_m ?? 0,
    walkingDurationMin: lead.walking_duration_min ?? 0,
    contactName: lead.contact_name,
    dStellarAddress: `${BUSINESS.streetAddress}, ${BUSINESS.neighborhood}, ${BUSINESS.addressLocality}`,
    dStellarRating: googleReviewStats.average,
    dStellarReviewCount: googleReviewStats.count,
    dStellarReviewQuote: quotable?.quote ?? "",
  };
}
