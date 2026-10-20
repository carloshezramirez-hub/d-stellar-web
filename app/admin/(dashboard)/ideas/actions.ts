"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { setIdeaStatus, type IdeaStatus } from "@/lib/insights/idea-status-db";

export async function updateIdeaStatus(id: string, status: IdeaStatus) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    throw new Error("No autorizado.");
  }
  await setIdeaStatus(id, status);
  revalidatePath("/admin/ideas");
  revalidatePath("/admin");
}
