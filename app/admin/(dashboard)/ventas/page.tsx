import { ConsoleShell } from "@/components/admin/console-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { KpiTile } from "@/components/admin/kpi-tile";
import { SalesChart } from "@/components/admin/ventas/sales-chart";
import { TopProductsChart } from "@/components/admin/ventas/top-products-chart";
import { resolveRange } from "@/lib/admin/date-range";
import { isOdooConfigured } from "@/lib/odoo/env";
import { fetchSalesSummary, fetchTopProducts } from "@/lib/odoo/sales";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function VentasPage({ searchParams }: PageProps) {
  const { range: rawRange } = await searchParams;
  const range = resolveRange(rawRange, "30");
  // "Todo" (days=null) no tiene un corte real — 180 días cubre de sobra el
  // histórico de Odoo (datos reales desde sept. 2026) sin pedir infinito.
  const chartDays = range.days ?? 180;

  if (!isOdooConfigured()) {
    return (
      <main className="min-h-screen">
        <ConsoleShell />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Ventas</p>
          <p className="mt-4 text-sm text-stellar-white/60">
            Esta sección lee ventas de piso directo de Odoo (Punto de Venta) — faltan las variables de entorno
            (ODOO_URL / ODOO_DB / ODOO_USERNAME / ODOO_API_KEY) en este ambiente.
          </p>
        </div>
      </main>
    );
  }

  const [summary, topProducts] = await Promise.all([fetchSalesSummary(chartDays), fetchTopProducts(chartDays)]);
  const periodOrders = summary.dailySeries.reduce((sum, d) => sum + d.orders, 0);
  const periodTotal = summary.dailySeries.reduce((sum, d) => sum + d.total, 0);

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-1 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Ventas</p>
        <p className="mb-6 max-w-2xl text-sm text-stellar-white/60">
          Ventas reales de piso (Punto de Venta), directo de Odoo.
        </p>

        <DateRangeFilter basePath="/admin/ventas" current={range.value} />

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiTile icon="📅" value={formatMoney(summary.todayTotal)} label={`hoy · ${summary.todayOrders} ventas`} accent="green" />
          <KpiTile icon="🗓️" value={formatMoney(summary.monthTotal)} label={`este mes · ${summary.monthOrders} ventas`} accent="pink" />
          <KpiTile icon="🧾" value={formatMoney(summary.avgTicket)} label="ticket promedio del mes" accent="purple" />
          <KpiTile icon="🛍️" value={formatMoney(periodTotal)} label={`${periodOrders} ventas en el periodo`} accent="blue" />
        </div>

        <div className="mb-10">
          <SalesChart data={summary.dailySeries} />
        </div>

        <div className="mb-10">
          <TopProductsChart data={topProducts} />
        </div>
      </div>
    </main>
  );
}
