import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SITE_SETTINGS_FALLBACK, type SiteSettings } from "@/lib/site-settings-types";

let _client: SupabaseClient | null = null;

function getSettingsDb(): SupabaseClient {
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

function isSettingsDbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

interface SiteSettingsRow {
  hours: SiteSettings["hours"];
  hours_exceptions: SiteSettings["hoursExceptions"];
  phone: string;
  phone_href: string;
  whatsapp_url: string;
  email: string;
  social: SiteSettings["social"];
  menu_month_label: SiteSettings["menuMonthLabel"];
  seasonal_decor_enabled: boolean;
  seasonal_decor_variant: string | null;
}

function rowToSettings(row: SiteSettingsRow): SiteSettings {
  return {
    hours: row.hours,
    hoursExceptions: row.hours_exceptions ?? [],
    phone: row.phone,
    phoneHref: row.phone_href,
    whatsappUrl: row.whatsapp_url,
    email: row.email,
    social: row.social,
    menuMonthLabel: row.menu_month_label,
    seasonalDecorEnabled: row.seasonal_decor_enabled,
    seasonalDecorVariant: row.seasonal_decor_variant,
  };
}

/**
 * Nunca lanza ni regresa null — si Supabase no está configurado o la fila
 * aún no existe, cae en SITE_SETTINGS_FALLBACK para que el resto del sitio
 * (footer, WhatsApp flotante, JSON-LD, etc.) siempre tenga algo que mostrar.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSettingsDbConfigured()) return SITE_SETTINGS_FALLBACK;
  const db = getSettingsDb();
  const { data, error } = await db.from("site_settings").select().eq("id", 1).maybeSingle();
  if (error) throw error;
  return data ? rowToSettings(data as SiteSettingsRow) : SITE_SETTINGS_FALLBACK;
}

export async function updateSiteSettings(input: SiteSettings): Promise<void> {
  const db = getSettingsDb();
  const { error } = await db
    .from("site_settings")
    .update({
      hours: input.hours,
      hours_exceptions: input.hoursExceptions,
      phone: input.phone,
      phone_href: input.phoneHref,
      whatsapp_url: input.whatsappUrl,
      email: input.email,
      social: input.social,
      menu_month_label: input.menuMonthLabel,
      seasonal_decor_enabled: input.seasonalDecorEnabled,
      seasonal_decor_variant: input.seasonalDecorVariant,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw error;
}

export type { SiteSettings } from "@/lib/site-settings-types";
