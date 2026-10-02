import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con service_role key — SOLO servidor (webhooks de pago,
 * panel /pedidos). Nunca importar este módulo desde un componente cliente.
 */
let _client: SupabaseClient | null = null;

export function getOrdersDb(): SupabaseClient {
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

export type OrderKind = "ticket" | "pickup";
export type EmailDeliveryStatus = "pending" | "sent" | "bounced" | "complained" | "failed";

export interface WebOrder {
  id: string;
  kind: OrderKind;
  code: string;
  payment_id: string;
  amount_mxn: number;
  currency: string;
  concept: string;
  items: unknown;
  event_slug: string | null;
  session_date_iso: string | null;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  locale: string;
  notes: string | null;
  email_customer_status: EmailDeliveryStatus;
  email_owner_status: EmailDeliveryStatus;
  email_customer_resend_id: string | null;
  email_owner_resend_id: string | null;
  raw_metadata: unknown;
  created_at: string;
}

export type NewWebOrder = Omit<
  WebOrder,
  | "id"
  | "created_at"
  | "email_customer_status"
  | "email_owner_status"
  | "email_customer_resend_id"
  | "email_owner_resend_id"
>;

/**
 * Inserta el pedido en cuanto Mercado Pago confirma el pago, antes de
 * intentar cualquier correo — así siempre queda un registro, pase lo que
 * pase con el envío. payment_id es único: si el webhook de Mercado Pago
 * reintenta (pasa seguido), la segunda llamada no crea una fila duplicada.
 * Devuelve `{ order, isNew: false }` cuando el pedido ya existía.
 */
export async function insertOrderIfNew(order: NewWebOrder): Promise<{ order: WebOrder; isNew: boolean }> {
  const db = getOrdersDb();

  const { data: existing, error: lookupError } = await db
    .from("web_orders")
    .select("*")
    .eq("payment_id", order.payment_id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return { order: existing as WebOrder, isNew: false };

  const { data, error } = await db.from("web_orders").insert(order).select("*").single();
  if (error) {
    // Carrera entre dos webhooks simultáneos para el mismo pago — el
    // constraint unique(payment_id) es la fuente de verdad real.
    if (error.code === "23505") {
      const { data: raceWinner, error: raceError } = await db
        .from("web_orders")
        .select("*")
        .eq("payment_id", order.payment_id)
        .single();
      if (raceError) throw raceError;
      return { order: raceWinner as WebOrder, isNew: false };
    }
    throw error;
  }
  return { order: data as WebOrder, isNew: true };
}

export async function updateEmailStatus(
  orderId: string,
  fields: Partial<
    Pick<WebOrder, "email_customer_status" | "email_owner_status" | "email_customer_resend_id" | "email_owner_resend_id">
  >,
) {
  const db = getOrdersDb();
  const { error } = await db.from("web_orders").update(fields).eq("id", orderId);
  if (error) throw error;
}

export async function markEmailStatusByResendId(resendId: string, status: EmailDeliveryStatus) {
  const db = getOrdersDb();

  const { error: customerError } = await db
    .from("web_orders")
    .update({ email_customer_status: status })
    .eq("email_customer_resend_id", resendId);
  if (customerError) throw customerError;

  const { error: ownerError } = await db
    .from("web_orders")
    .update({ email_owner_status: status })
    .eq("email_owner_resend_id", resendId);
  if (ownerError) throw ownerError;
}

export async function listOrders(limit = 200): Promise<WebOrder[]> {
  const db = getOrdersDb();
  const { data, error } = await db
    .from("web_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as WebOrder[];
}

export async function getOrderById(id: string): Promise<WebOrder | null> {
  const db = getOrdersDb();
  const { data, error } = await db.from("web_orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as WebOrder) ?? null;
}
