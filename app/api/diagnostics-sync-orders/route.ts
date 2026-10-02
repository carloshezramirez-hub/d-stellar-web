import { NextResponse } from "next/server";
import { insertOrderIfNew } from "@/lib/orders-db";
import { buildTicketWebOrder, buildPickupWebOrder, isTicketPayment, isPickupPayment } from "@/lib/orders-from-payment";
import { searchAllApprovedPayments } from "@/lib/payments/mercadopago";

// TEMPORAL — corre el mismo backfill que el botón "Sincronizar con Mercado
// Pago" de /pedidos, pero sin pasar por el login (para correrlo una vez
// desde aquí en vez de pedirle a Carlos que entre y haga clic). Borrar este
// archivo (y DIAGNOSTIC_TEST_SECRET) en cuanto se confirme el resultado.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== process.env.DIAGNOSTIC_TEST_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let payments;
  try {
    payments = await searchAllApprovedPayments();
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }

  let inserted = 0;
  let skipped = 0;
  let unrecognized = 0;
  const insertedCodes: string[] = [];
  const errors: string[] = [];

  for (const payment of payments) {
    if (!payment.id) continue;
    const paymentId = String(payment.id);
    const metadata = (payment.metadata ?? {}) as Record<string, unknown>;

    const newOrder = isTicketPayment(metadata)
      ? buildTicketWebOrder(payment, paymentId)
      : isPickupPayment(metadata)
        ? buildPickupWebOrder(payment, paymentId)
        : null;

    if (!newOrder) {
      unrecognized += 1;
      continue;
    }

    const createdAt = payment.date_approved || payment.date_created;

    try {
      const { isNew } = await insertOrderIfNew(createdAt ? { ...newOrder, created_at: createdAt } : newOrder);
      if (isNew) {
        inserted += 1;
        insertedCodes.push(newOrder.code);
      } else {
        skipped += 1;
      }
    } catch (err) {
      errors.push(`${paymentId}: ${String(err)}`);
    }
  }

  return NextResponse.json({ ok: true, scanned: payments.length, inserted, skipped, unrecognized, insertedCodes, errors });
}
