import Link from "next/link";
import { ConsoleShell } from "@/components/admin/console-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { KpiTile } from "@/components/admin/kpi-tile";
import { TicketsChart } from "@/components/admin/eventos/tickets-chart";
import { resolveRange, withinRange } from "@/lib/admin/date-range";
import { listAllEvents } from "@/lib/events-db";
import { listOrders } from "@/lib/orders-db";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminEventosPage({ searchParams }: PageProps) {
  const { range: rawRange } = await searchParams;
  // Default "Todo": los boletos de un evento suelen venderse semanas antes,
  // así que filtrar a "30 días" por defecto haría ver ventas en cero.
  const range = resolveRange(rawRange, "all");

  const [events, allOrders] = await Promise.all([listAllEvents(), listOrders(1000)]);
  const orders = allOrders.filter((o) => withinRange(o.created_at, range.days));

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
  const totalTickets = [...statsBySlug.values()].reduce((sum, s) => sum + s.count, 0);
  const totalRevenue = [...statsBySlug.values()].reduce((sum, s) => sum + s.revenue, 0);
  const chartData = events.map((e) => ({ label: e.title, boletos: statsBySlug.get(e.slug)?.count ?? 0 }));

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <p className="font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Eventos</p>
          <Link
            href="/admin/eventos/nuevo"
            className="bg-stellar-pink px-4 py-2 font-tag text-xs font-bold uppercase tracking-widest text-stellar-black"
          >
            + Nuevo evento
          </Link>
        </div>

        <DateRangeFilter basePath="/admin/eventos" current={range.value} />
        <p className="mb-6 -mt-3 text-[11px] text-stellar-white/35">
          El rango filtra las ventas de boletos (KPIs y gráfica) por fecha de compra — la lista de eventos de abajo
          siempre muestra todo.
        </p>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiTile icon="📅" value={String(upcoming.length)} label="eventos próximos" accent="green" />
          <KpiTile icon="🎟️" value={String(totalTickets)} label="boletos vendidos" accent="pink" />
          <KpiTile icon="💰" value={formatMoney(totalRevenue)} label="ingreso en el periodo" accent="purple" />
          <KpiTile icon="🗄️" value={String(past.length)} label="eventos pasados" accent="white" />
        </div>

        <div className="mb-10">
          <TicketsChart data={chartData} />
        </div>

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
