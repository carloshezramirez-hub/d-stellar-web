import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { PickupOrderFormValues } from "@/lib/pickup-schema";
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

export async function getPickupPayment(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}
