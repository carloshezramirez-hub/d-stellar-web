import Link from "next/link";
import { listAllEvents } from "@/lib/events-db";
import { listOrders } from "@/lib/orders-db";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export default async function AdminEventosPage() {
  const [events, orders] = await Promise.all([listAllEvents(), listOrders(1000)]);

  const statsBySlug = new Map<string, { count: number; revenue: number }>();
  for (const order of orders) {
    if (order.kind !== "ticket" || !order.event_slug) continue;
    const current = statsBySlug.get(order.event_slug) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += order.amount_mxn;
    statsBySlug.set(order.event_slug, current);
  }

  const upcoming = events.filter((e) => e.status === "upcoming");
  const past = events.filter((e) => e.status === "past");

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h1 className="font-demi text-sm font-bold uppercase tracking-widest text-stellar-white">d-stellar · Eventos</h1>
          <Link href="/admin" className="text-xs text-stellar-white/60 underline underline-offset-4">
            ← Volver al panel
          </Link>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="bg-stellar-pink px-4 py-2 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black"
        >
          + Nuevo evento
        </Link>
      </header>

      <div className="mx-auto max-w-5xl p-6">
        {upcoming.length === 0 && past.length === 0 && <p className="text-sm text-stellar-white/60">Todavía no hay eventos.</p>}

        {upcoming.length > 0 && (
          <div className="mb-10 grid gap-4">
            {upcoming.map((event) => {
              const stats = statsBySlug.get(event.slug);
              return (
                <Link
                  key={event.slug}
                  href={`/admin/eventos/${event.slug}`}
                  className="flex flex-wrap items-center justify-between gap-4 border-2 border-line bg-stellar-black-soft p-5 transition-colors hover:border-stellar-pink"
                >
                  <div>
                    <p className="font-demi text-lg font-bold text-stellar-white">{event.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-stellar-pink/70">
                      Próximo
                      {event.dateISO && ` · ${new Date(event.dateISO).toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-stellar-white/80">{stats?.count ?? 0} boletos vendidos</p>
                    <p className="text-sm text-stellar-green">{formatMoney(stats?.revenue ?? 0)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {past.length > 0 && (
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-stellar-white/30">Eventos pasados</p>
            <div className="grid gap-2">
              {past.map((event) => {
                const stats = statsBySlug.get(event.slug);
                return (
                  <Link
                    key={event.slug}
                    href={`/admin/eventos/${event.slug}`}
                    className="flex flex-wrap items-center justify-between gap-4 border border-line/40 p-3 opacity-60 transition-opacity hover:opacity-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-stellar-white/70">{event.title}</p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-widest text-stellar-white/35">
                        Pasado
                        {event.dateISO && ` · ${new Date(event.dateISO).toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stellar-white/50">{stats?.count ?? 0} boletos vendidos</p>
                      <p className="text-xs text-stellar-white/40">{formatMoney(stats?.revenue ?? 0)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
