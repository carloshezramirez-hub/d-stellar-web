import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { updateReviewStats } from "@/lib/reviews-db";
import { revalidateReviewsPaths } from "@/lib/admin/revalidate-content";
import type { ReviewStats } from "@/lib/reviews-types";

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let input: ReviewStats;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    await updateReviewStats(input);
    revalidateReviewsPaths();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/reviews/stats] update", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
