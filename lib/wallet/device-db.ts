import { getWalletDb } from "./loyalty-db";

export interface LoyaltyDevice {
  id: string;
  device_library_identifier: string;
  loyalty_member_id: string;
  push_token: string;
  created_at: string;
}

export async function registerDevice(input: {
  deviceLibraryIdentifier: string;
  loyaltyMemberId: string;
  pushToken: string;
}): Promise<{ alreadyRegistered: boolean }> {
  const db = getWalletDb();
  const { data: existing, error: selectError } = await db
    .from("loyalty_devices")
    .select("id")
    .eq("device_library_identifier", input.deviceLibraryIdentifier)
    .eq("loyalty_member_id", input.loyaltyMemberId)
    .maybeSingle();
  if (selectError) throw selectError;

  const { error } = await db.from("loyalty_devices").upsert(
    {
      device_library_identifier: input.deviceLibraryIdentifier,
      loyalty_member_id: input.loyaltyMemberId,
      push_token: input.pushToken,
    },
    { onConflict: "device_library_identifier,loyalty_member_id" },
  );
  if (error) throw error;

  return { alreadyRegistered: Boolean(existing) };
}

export async function unregisterDevice(input: { deviceLibraryIdentifier: string; loyaltyMemberId: string }): Promise<void> {
  const db = getWalletDb();
  const { error } = await db
    .from("loyalty_devices")
    .delete()
    .eq("device_library_identifier", input.deviceLibraryIdentifier)
    .eq("loyalty_member_id", input.loyaltyMemberId);
  if (error) throw error;
}

export async function getDevicesForMember(loyaltyMemberId: string): Promise<LoyaltyDevice[]> {
  const db = getWalletDb();
  const { data, error } = await db.from("loyalty_devices").select().eq("loyalty_member_id", loyaltyMemberId);
  if (error) throw error;
  return (data as LoyaltyDevice[]) ?? [];
}

export async function getAllDevices(): Promise<LoyaltyDevice[]> {
  const db = getWalletDb();
  const { data, error } = await db.from("loyalty_devices").select();
  if (error) throw error;
  return (data as LoyaltyDevice[]) ?? [];
}

/**
 * Serial numbers de las tarjetas de ESTE dispositivo que cambiaron desde
 * `since` (protocolo PassKit: GET .../registrations/{passTypeId}).
 */
export async function getUpdatedSerialsForDevice(
  deviceLibraryIdentifier: string,
  since: string | null,
): Promise<{ serialNumbers: string[]; lastUpdated: string }> {
  const db = getWalletDb();
  const { data, error } = await db
    .from("loyalty_devices")
    .select("loyalty_members(serial_number, updated_at)")
    .eq("device_library_identifier", deviceLibraryIdentifier);
  if (error) throw error;

  type Row = { loyalty_members: { serial_number: string; updated_at: string } | null };
  const rows = (data as unknown as Row[]) ?? [];
  const sinceMs = since ? Date.parse(since) : 0;

  const changed = rows
    .map((row) => row.loyalty_members)
    .filter((m): m is { serial_number: string; updated_at: string } => Boolean(m))
    .filter((m) => Date.parse(m.updated_at) > sinceMs);

  const lastUpdated = rows.reduce((max, row) => {
    const t = row.loyalty_members?.updated_at;
    return t && Date.parse(t) > Date.parse(max) ? t : max;
  }, new Date(0).toISOString());

  return { serialNumbers: changed.map((m) => m.serial_number), lastUpdated };
}
