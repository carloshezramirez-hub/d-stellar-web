import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { EventRecord } from "@/lib/events-types";

/**
 * Cliente de Supabase con service_role key — SOLO servidor. Nunca importar
 * este módulo desde un componente cliente.
 */
let _client: SupabaseClient | null = null;

function getEventsDb(): SupabaseClient {
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

// Fila cruda de la tabla `events` (snake_case, ver supabase/schema.sql).
interface EventRow {
  slug: string;
  title: string;
  date_iso: string | null;
  end_iso: string | null;
  time_known: boolean;
  month_label: { es: string; en: string } | null;
  session_dates: string[] | null;
  sold_out_session_dates: string[] | null;
  session_ticket_limits: EventRecord["sessionTicketLimits"] | null;
  dates_summary: { es: string; en: string } | null;
  doors_note: { es: string; en: string } | null;
  summary: { es: string; en: string };
  description: { es: string[]; en: string[] };
  includes: { es: string[]; en: string[] } | null;
  capacity: number | null;
  price_mxn: number | null;
  tickets: EventRecord["tickets"] | null;
  cover_image: string;
  gallery_images: string[] | null;
  image_alt: { es: string; en: string };
  status: "upcoming" | "past";
  external_url: string | null;
}

function rowToEventRecord(row: EventRow): EventRecord {
  return {
    slug: row.slug,
    title: row.title,
    dateISO: row.date_iso ?? undefined,
    endISO: row.end_iso ?? undefined,
    timeKnown: row.time_known,
    monthLabel: row.month_label ?? undefined,
    sessionDates: row.session_dates ?? undefined,
    soldOutSessionDates: row.sold_out_session_dates ?? undefined,
    sessionTicketLimits: row.session_ticket_limits ?? undefined,
    datesSummary: row.dates_summary ?? undefined,
    doorsNote: row.doors_note ?? undefined,
    summary: row.summary,
    description: row.description,
    includes: row.includes ?? undefined,
    capacity: row.capacity ?? undefined,
    priceMXN: row.price_mxn ?? undefined,
    tickets: row.tickets ?? undefined,
    coverImage: row.cover_image,
    galleryImages: row.gallery_images ?? undefined,
    imageAlt: row.image_alt,
    status: row.status,
    externalUrl: row.external_url ?? undefined,
  };
}

function eventRecordToRow(input: EventRecord) {
  return {
    slug: input.slug,
    title: input.title,
    date_iso: input.dateISO ?? null,
    end_iso: input.endISO ?? null,
    time_known: input.timeKnown ?? true,
    month_label: input.monthLabel ?? null,
    session_dates: input.sessionDates ?? null,
    sold_out_session_dates: input.soldOutSessionDates ?? null,
    session_ticket_limits: input.sessionTicketLimits ?? null,
    dates_summary: input.datesSummary ?? null,
    doors_note: input.doorsNote ?? null,
    summary: input.summary,
    description: input.description,
    includes: input.includes ?? null,
    capacity: input.capacity ?? null,
    price_mxn: input.priceMXN ?? null,
    tickets: input.tickets ?? null,
    cover_image: input.coverImage,
    gallery_images: input.galleryImages ?? null,
    image_alt: input.imageAlt,
    status: input.status,
    external_url: input.externalUrl ?? null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Builds (y previews sin credenciales) no tienen NEXT_PUBLIC_SUPABASE_URL /
 * SUPABASE_SERVICE_ROLE_KEY configurados (solo producción los tiene en
 * Vercel) — las funciones de lectura regresan vacío en vez de tronar el
 * build entero, mismo patrón que isAppleWalletConfigured()/
 * isAnalyticsDashboardConfigured() en el resto del repo.
 */
export function isEventsDbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  if (!isEventsDbConfigured()) return null;
  const db = getEventsDb();
  const { data, error } = await db.from("events").select().eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToEventRecord(data as EventRow) : null;
}

export async function listUpcomingEvents(): Promise<EventRecord[]> {
  if (!isEventsDbConfigured()) return [];
  const db = getEventsDb();
  const { data, error } = await db
    .from("events")
    .select()
    .eq("status", "upcoming")
    .order("date_iso", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return ((data as EventRow[]) ?? []).map(rowToEventRecord);
}

export async function listPastEvents(): Promise<EventRecord[]> {
  if (!isEventsDbConfigured()) return [];
  const db = getEventsDb();
  const { data, error } = await db
    .from("events")
    .select()
    .eq("status", "past")
    .order("date_iso", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return ((data as EventRow[]) ?? []).map(rowToEventRecord);
}

/** Todos los eventos (ambos status) — usado por generateStaticParams, sitemap y /admin/eventos. */
export async function listAllEvents(): Promise<EventRecord[]> {
  if (!isEventsDbConfigured()) return [];
  const db = getEventsDb();
  const { data, error } = await db.from("events").select().order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as EventRow[]) ?? []).map(rowToEventRecord);
}

export async function createEvent(input: EventRecord): Promise<EventRecord> {
  const db = getEventsDb();
  const { data, error } = await db.from("events").insert(eventRecordToRow(input)).select().single();
  if (error) throw error;
  return rowToEventRecord(data as EventRow);
}

/** `currentSlug` identifica la fila a actualizar — `input.slug` puede traer un slug nuevo. */
export async function updateEvent(currentSlug: string, input: EventRecord): Promise<EventRecord> {
  const db = getEventsDb();
  const { data, error } = await db
    .from("events")
    .update(eventRecordToRow(input))
    .eq("slug", currentSlug)
    .select()
    .single();
  if (error) throw error;
  return rowToEventRecord(data as EventRow);
}

export async function deleteEvent(slug: string): Promise<void> {
  const db = getEventsDb();
  const { error } = await db.from("events").delete().eq("slug", slug);
  if (error) throw error;
}

export { eventStartingPrice } from "@/lib/events-types";
export type { EventRecord, EventTicket } from "@/lib/events-types";
