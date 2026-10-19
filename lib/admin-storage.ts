import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const EVENT_IMAGES_BUCKET = "event-images";

let _client: SupabaseClient | null = null;

function getStorageDb(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Sube una imagen al bucket público `event-images` y regresa su URL pública. */
export async function uploadEventImage(file: File): Promise<string> {
  const db = getStorageDb();
  const path = `${randomUUID()}-${sanitizeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await db.storage.from(EVENT_IMAGES_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;

  const { data } = db.storage.from(EVENT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
