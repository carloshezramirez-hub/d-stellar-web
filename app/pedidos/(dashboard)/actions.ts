"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ORDERS_SESSION_COOKIE, isValidOrdersSessionCookie } from "@/lib/orders-auth";
import { getOrderById, updateEmailStatus, getOrdersDb } from "@/lib/orders-db";
import { sendPaymentMail } from "@/lib/notifications/resend-mailer";
import { buildTicketCustomerEmail, type TicketOrderData } from "@/lib/notifications/ticket-templates";
import { buildPickupCustomerEmail } from "@/lib/notifications/templates";
import type { PickupOrderFormValues } from "@/lib/pickup-schema";

async function requireSession() {
  const cookieStore = await cookies();
  return isValidOrdersSessionCookie(cookieStore.get(ORDERS_SESSION_COOKIE)?.value);
}

/**
 * Reenvía la confirmación de pago al cliente, reconstruyendo el correo
 * exacto a partir de lo que quedó guardado en web_orders al momento del
 * pago — no depende de que el evento/producto original siga existiendo tal
 * cual. Si `overrideEmail` viene y es distinto al guardado (ej. el cliente
 * avisó que se equivocó al escribir su correo, como pasó con TIX-576882),
 * también corrige customer_email antes de reenviar.
 */
export async function resendOrderEmail(orderId: string, overrideEmail?: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireSession())) return { ok: false, error: "unauthorized" };

  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: "not_found" };

  const targetEmail = overrideEmail?.trim() || order.customer_email;

  if (overrideEmail && overrideEmail.trim() && overrideEmail.trim() !== order.customer_email) {
    const { error } = await getOrdersDb().from("web_orders").update({ customer_email: targetEmail }).eq("id", order.id);
    if (error) return { ok: false, error: "update_email_failed" };
  }

  const locale = order.locale === "en" ? "en" : "es";
  const paymentInfo = { amountMXN: order.amount_mxn, paymentId: order.payment_id };

  let customerEmail: { subject: string; html: string };
  if (order.kind === "ticket") {
    const items = order.items as {
      eventTitle: string;
      ticketName: string;
      dateLabel: string;
      qty: number;
      unitPriceMXN: number;
    };
    const data: TicketOrderData = {
      eventTitle: items.eventTitle,
      ticketName: items.ticketName,
      dateLabel: items.dateLabel,
      qty: items.qty,
      unitPriceMXN: items.unitPriceMXN,
      name: order.customer_name ?? "",
      email: targetEmail,
      phone: order.customer_phone ?? "",
      notes: order.notes ?? undefined,
    };
    customerEmail = buildTicketCustomerEmail(data, order.code, locale, paymentInfo);
  } else {
    const items = order.items as { date: string; time: string; lines: PickupOrderFormValues["items"] };
    const data: PickupOrderFormValues = {
      name: order.customer_name ?? "",
      email: targetEmail,
      phone: order.customer_phone ?? "",
      date: items.date,
      time: items.time,
      notes: order.notes ?? undefined,
      items: items.lines,
    };
    customerEmail = buildPickupCustomerEmail(data, order.code, locale, paymentInfo);
  }

  try {
    const result = await sendPaymentMail({ to: targetEmail, subject: customerEmail.subject, html: customerEmail.html });
    await updateEmailStatus(order.id, { email_customer_status: "sent", email_customer_resend_id: result.id });
    revalidatePath("/pedidos");
    return { ok: true };
  } catch (err) {
    console.error("[pedidos/resendOrderEmail]", err);
    await updateEmailStatus(order.id, { email_customer_status: "failed" }).catch(() => {});
    revalidatePath("/pedidos");
    return { ok: false, error: "send_failed" };
  }
}
