import { ConsoleShell } from "@/components/admin/console-shell";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { KpiTile } from "@/components/admin/kpi-tile";
import { AvgTicketTrendChart, MonthlyRevenueChart } from "@/components/admin/ventas/monthly-trend-charts";
import { SalesChart } from "@/components/admin/ventas/sales-chart";
import { TopProductsTable } from "@/components/admin/ventas/top-products-table";
import { WeekdayChart } from "@/components/admin/ventas/weekday-chart";
import { resolveDateRange } from "@/lib/admin/date-range";
import { SECTION_THEME } from "@/lib/admin/section-theme";
import { isOdooConfigured } from "@/lib/odoo/env";
import { fetchMonthlyTrend, fetchSalesSummary, fetchTopProducts, fetchWeekdayPattern } from "@/lib/odoo/sales";

const ACCENT = SECTION_THEME.ventas.accent;

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

interface PageProps {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

export default async function VentasPage({ searchParams }: PageProps) {
  const { range: rawRange, from, to } = await searchParams;
  const range = resolveDateRange(rawRange, "30", from, to);

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

  const [summary, topProducts, weekdayPattern, monthlyTrend] = await Promise.all([
    fetchSalesSummary(range),
    fetchTopProducts(range),
    fetchWeekdayPattern(range),
    fetchMonthlyTrend(),
  ]);
  const periodOrders = summary.dailySeries.reduce((sum, d) => sum + d.orders, 0);
  const periodTotal = summary.dailySeries.reduce((sum, d) => sum + d.total, 0);

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-1 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Ventas</p>
        <p className="mb-6 max-w-2xl text-sm text-stellar-white/60">
          Ventas reales de piso (Punto de Venta), directo de Odoo. Ticket promedio = monto total pagado por venta
          (Odoo no tiene devoluciones registradas todavía).
        </p>

        <DateRangeFilter basePath="/admin/ventas" current={range.value} accent={ACCENT} from={from} to={to} />

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiTile icon="📅" value={formatMoney(summary.todayTotal)} label={`hoy · ${summary.todayOrders} ventas`} accent={ACCENT} />
          <KpiTile icon="🗓️" value={formatMoney(summary.monthTotal)} label={`este mes · ${summary.monthOrders} ventas`} accent={ACCENT} />
          <KpiTile icon="🧾" value={formatMoney(summary.avgTicket)} label="ticket promedio del mes" accent={ACCENT} />
          <KpiTile icon="🛍️" value={formatMoney(periodTotal)} label={`${periodOrders} ventas en el periodo`} accent={ACCENT} />
        </div>

        <div className="mb-10">
          <SalesChart data={summary.dailySeries} />
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <AvgTicketTrendChart data={monthlyTrend} />
          <MonthlyRevenueChart data={monthlyTrend} />
        </div>

        <div className="mb-10">
          <WeekdayChart data={weekdayPattern} />
        </div>

        <div className="mb-10">
          <TopProductsTable products={topProducts} />
        </div>
      </div>
    </main>
  );
}
