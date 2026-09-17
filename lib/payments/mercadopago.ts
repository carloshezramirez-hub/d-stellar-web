import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { PickupOrderFormValues } from "@/lib/pickup-schema";
import type { TicketOrderData } from "@/lib/notifications/ticket-templates";
import { SITE_URL } from "@/data/site";
import { mercadoPagoEnv } from "./env";

type Locale = "es" | "en";

let client: MercadoPagoConfig | null = null;

function getClient() {
  if (!client) {
    client = new MercadoPagoConfig({ accessToken: mercadoPagoEnv.accessToken! });
  }
  return client;
}

function itemTitle(line: PickupOrderFormValues["items"][number]) {
  return line.flavors?.length ? `${line.name} (${line.flavors.join(", ")})` : line.name;
}

export async function createPickupPreference(data: PickupOrderFormValues, code: string, locale: Locale) {
  const localePath = locale === "en" ? "/en" : "";
  const pickupUrl = `${SITE_URL}${localePath}/pickup`;

  const preference = new Preference(getClient());
  const result = await preference.create({
    body: {
      items: data.items.map((line) => ({
        id: line.slug,
        title: itemTitle(line),
        quantity: line.qty,
        unit_price: line.priceMXN,
        currency_id: "MXN",
      })),
      payer: { name: data.name, email: data.email },
      external_reference: code,
      statement_descriptor: "D-STELLAR",
      metadata: {
        code,
        name: data.name,
        email: data.email,
        phone: data.phone,
        date: data.date,
        time: data.time,
        notes: data.notes ?? "",
        items: JSON.stringify(data.items),
        locale,
      },
      back_urls: {
        success: `${pickupUrl}?status=approved&code=${code}`,
        pending: `${pickupUrl}?status=pending&code=${code}`,
        failure: `${pickupUrl}?status=failure&code=${code}`,
      },
      auto_return: "approved",
      notification_url: `${SITE_URL}/api/pickup/webhook`,
    },
  });

  if (!result.init_point) {
    throw new Error("mercadopago_no_init_point");
  }

  return { initPoint: result.init_point };
}

export async function createTicketPreference(
  orderData: TicketOrderData,
  eventSlug: string,
  ticketIndex: number,
  code: string,
  locale: Locale,
) {
  const localePath = locale === "en" ? "/en" : "";
  const eventUrl = `${SITE_URL}${localePath}/events/${eventSlug}`;

  const preference = new Preference(getClient());
  const result = await preference.create({
    body: {
      items: [
        {
          id: `${eventSlug}-${ticketIndex}`,
          title: `${orderData.eventTitle} — ${orderData.ticketName}`,
          quantity: orderData.qty,
          unit_price: orderData.unitPriceMXN,
          currency_id: "MXN",
        },
      ],
      payer: { name: orderData.name, email: orderData.email },
      external_reference: code,
      statement_descriptor: "D-STELLAR",
      metadata: {
        code,
        eventSlug,
        ticketIndex: String(ticketIndex),
        qty: String(orderData.qty),
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        notes: orderData.notes ?? "",
        locale,
      },
      back_urls: {
        success: `${eventUrl}?status=approved&code=${code}`,
        pending: `${eventUrl}?status=pending&code=${code}`,
        failure: `${eventUrl}?status=failure&code=${code}`,
      },
      auto_return: "approved",
      notification_url: `${SITE_URL}/api/tickets/webhook`,
    },
  });

  if (!result.init_point) {
    throw new Error("mercadopago_no_init_point");
  }

  return { initPoint: result.init_point };
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}
