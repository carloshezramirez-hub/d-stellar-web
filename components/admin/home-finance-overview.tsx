import { KpiTile } from "@/components/admin/kpi-tile";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export interface FinanceOverviewData {
  posSalesMonth: number;
  webRevenueMonth: number;
  adsSpendTotal: number;
}

/**
 * Resumen rápido de ingresos/egresos en el home del panel. Ingresos =
 * ventas de piso (Odoo, mes calendario) + web (boletos/pickup, mes
 * calendario) — mismo periodo, se pueden sumar. Egresos solo tiene una
 * fuente real conectada hoy (anuncios de TikTok, histórico completo desde
 * que empezamos a pautar) — por eso NO se calcula un "balance neto": mezclar
 * un ingreso mensual con un egreso histórico daría un número engañoso. Odoo
 * todavía no tiene facturas de proveedor/compras reales capturadas
 * (in_invoice=0, purchase.order sin órdenes confirmadas) — en cuanto
 * existan, agregar egresos operativos aquí.
 */
export function HomeFinanceOverview({ data }: { data: FinanceOverviewData }) {
  const totalIncome = data.posSalesMonth + data.webRevenueMonth;

  return (
    <div className="mb-10 rounded-lg border border-line bg-stellar-black-soft p-6">
      <p className="mb-1 font-demi text-sm font-bold uppercase tracking-widest text-stellar-white/70">
        Resumen financiero rápido
      </p>
      <p className="mb-5 text-xs text-stellar-white/40">
        Ingresos de este mes (piso + web). Egresos: solo anuncios por ahora — Odoo no tiene gastos/compras reales
        capturados todavía, así que no se muestra un balance neto que mezclaría periodos distintos.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile icon="🏪" value={formatMoney(data.posSalesMonth)} label="ventas de piso (mes)" accent="green" />
        <KpiTile icon="🌐" value={formatMoney(data.webRevenueMonth)} label="ingresos web (mes)" accent="purple" />
        <KpiTile icon="💵" value={formatMoney(totalIncome)} label="ingreso total (mes)" accent="blue" />
        <KpiTile icon="📣" value={formatMoney(data.adsSpendTotal)} label="gasto en anuncios (histórico)" accent="red" />
      </div>
    </div>
  );
}
