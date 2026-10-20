import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/events-db";
import { listOrdersByEventSlug } from "@/lib/orders-db";
import { EventForm } from "@/components/admin/event-form";
import { ConsoleShell } from "@/components/admin/console-shell";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
}

export default async function EditarEventoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, orders] = await Promise.all([getEventBySlug(slug), listOrdersByEventSlug(slug)]);
  if (!event) notFound();

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount_mxn, 0);

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link href="/admin/eventos" className="text-xs text-stellar-white/60 underline underline-offset-4">
          ← Volver a eventos
        </Link>
        <h1 className="mt-2 mb-6 font-demi text-xl font-bold text-stellar-white">{event.title}</h1>
        <EventForm initialEvent={event} />

        <section className="mt-10 border-2 border-line bg-stellar-black-soft p-6">
          <p className="font-tag text-xs uppercase tracking-widest text-stellar-pink">Ventas de boletos</p>
          <p className="mt-2 text-sm text-stellar-white/70">
            {orders.length} boleto{orders.length !== 1 ? "s" : ""} vendido{orders.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-stellar-green">{formatMoney(totalRevenue)}</span>
          </p>

          {orders.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-widest text-stellar-white/50">
                    <th className="py-2 pr-4">Fecha de pago</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Contacto</th>
                    <th className="py-2 pr-4">Concepto</th>
                    <th className="py-2 pr-4">Sesión</th>
                    <th className="py-2 pr-4">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-line/50 text-stellar-white">
                      <td className="whitespace-nowrap py-2 pr-4 text-stellar-white/70">{formatDateTime(order.created_at)}</td>
                      <td className="py-2 pr-4">{order.customer_name || "—"}</td>
                      <td className="py-2 pr-4">
                        <div className="break-all">{order.customer_email}</div>
                        <div className="text-xs text-stellar-white/50">{order.customer_phone || "—"}</div>
                      </td>
                      <td className="py-2 pr-4">{order.concept}</td>
                      <td className="whitespace-nowrap py-2 pr-4 text-stellar-white/70">
                        {order.session_date_iso ? formatDateTime(order.session_date_iso) : "—"}
                      </td>
                      <td className="whitespace-nowrap py-2 pr-4">{formatMoney(order.amount_mxn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
