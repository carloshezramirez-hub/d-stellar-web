import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { uploadEventImage } from "@/lib/admin-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidAdminSession(session)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
  }

  try {
    const url = await uploadEventImage(file);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[api/admin/upload-image]", err);
    return NextResponse.json({ error: "upload_failed" }, { status: 502 });
  }
}
