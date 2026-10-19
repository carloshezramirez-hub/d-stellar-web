import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes, randomUUID } from "node:crypto";

/**
 * Cliente de Supabase con service_role key — SOLO servidor.
 * Nunca importar este módulo desde un componente cliente.
 */
let _client: SupabaseClient | null = null;

export function getWalletDb(): SupabaseClient {
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

export interface LoyaltyMember {
  id: string;
  serial_number: string;
  auth_token: string;
  name: string;
  phone: string;
  email: string | null;
  locale: "es" | "en";
  stamps: number;
  stamps_required: number;
  lifetime_stamps: number;
  created_at: string;
  updated_at: string;
}

export async function createLoyaltyMember(input: {
  name: string;
  phone: string;
  email?: string;
  locale: "es" | "en";
}): Promise<LoyaltyMember> {
  const db = getWalletDb();
  const serial_number = randomUUID();
  const auth_token = randomBytes(24).toString("hex");

  const { data, error } = await db
    .from("loyalty_members")
    .insert({
      serial_number,
      auth_token,
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      locale: input.locale,
    })
    .select()
    .single();

  if (error) throw error;
  return data as LoyaltyMember;
}

export async function getLoyaltyMemberBySerial(serialNumber: string): Promise<LoyaltyMember | null> {
  const db = getWalletDb();
  const { data, error } = await db.from("loyalty_members").select().eq("serial_number", serialNumber).maybeSingle();

  if (error) throw error;
  return (data as LoyaltyMember) ?? null;
}

/** Suma un sello (tope en stamps_required) y marca el pase como cambiado. */
export async function incrementStamp(serialNumber: string): Promise<LoyaltyMember | null> {
  const db = getWalletDb();
  const member = await getLoyaltyMemberBySerial(serialNumber);
  if (!member) return null;

  const stamps = Math.min(member.stamps + 1, member.stamps_required);
  const { data, error } = await db
    .from("loyalty_members")
    .update({ stamps, lifetime_stamps: member.lifetime_stamps + 1, updated_at: new Date().toISOString() })
    .eq("serial_number", serialNumber)
    .select()
    .single();

  if (error) throw error;
  return data as LoyaltyMember;
}

/** Canjea la recompensa: reinicia el contador de sellos a cero. */
export async function redeemAndReset(serialNumber: string): Promise<LoyaltyMember | null> {
  const db = getWalletDb();
  const { data, error } = await db
    .from("loyalty_members")
    .update({ stamps: 0, updated_at: new Date().toISOString() })
    .eq("serial_number", serialNumber)
    .select()
    .maybeSingle();

  if (error) throw error;
  return (data as LoyaltyMember) ?? null;
}

/**
 * Marca TODOS los pases como cambiados — usado por el cron diario de la
 * frase del geofence, para que Wallet vuelva a pedir cada pase y recoja el
 * nuevo `relevantText` aunque el conteo de sellos no haya cambiado.
 */
export async function touchAllLoyaltyMembers(): Promise<void> {
  const db = getWalletDb();
  const { error } = await db.from("loyalty_members").update({ updated_at: new Date().toISOString() }).not("id", "is", null);
  if (error) throw error;
}
