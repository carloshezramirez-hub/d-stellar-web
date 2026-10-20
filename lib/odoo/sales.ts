import { odooSearchRead } from "@/lib/odoo/client";

const MX_TZ = "America/Mexico_City";
const DAY_MS = 24 * 60 * 60 * 1000;

// Odoo guarda datetime en UTC "naive" (sin offset) — hay que formatear los
// cortes de fecha en ese mismo formato para que el domain filter funcione.
function toOdooUtcString(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function mxDayKey(date: Date): string {
  // en-CA produce YYYY-MM-DD directo, útil como llave de agrupación.
  return new Intl.DateTimeFormat("en-CA", { timeZone: MX_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

interface RawPosOrder {
  id: number;
  date_order: string;
  amount_total: number;
}

export interface SalesDayPoint {
  key: string;
  label: string;
  total: number;
  orders: number;
}

export interface SalesSummary {
  todayTotal: number;
  todayOrders: number;
  monthTotal: number;
  monthOrders: number;
  avgTicket: number;
  dailySeries: SalesDayPoint[];
}

/**
 * Trae ventas de piso (Punto de Venta) y arma el resumen completo en una
 * sola pasada. `chartDays` controla cuántos días dibuja la gráfica diaria
 * (el filtro de fecha del dashboard); "hoy"/"este mes" siempre son el día y
 * el mes calendario reales sin importar el rango elegido, así que la
 * ventana que se le pide a Odoo es siempre al menos 35 días (cubre
 * cualquier mes completo) aunque el usuario esté viendo solo "7 días".
 */
export async function fetchSalesSummary(chartDays = 30): Promise<SalesSummary> {
  const days = chartDays;
  const fetchWindowDays = Math.max(days, 35);
  const now = new Date();
  const cutoff = new Date(now.getTime() - (fetchWindowDays + 1) * DAY_MS);

  const orders = await odooSearchRead<RawPosOrder>(
    "pos.order",
    [
      ["date_order", ">=", toOdooUtcString(cutoff)],
      ["state", "!=", "cancel"],
    ],
    { fields: ["date_order", "amount_total"], order: "date_order asc" },
  );

  const todayKey = mxDayKey(now);
  const monthPrefix = todayKey.slice(0, 7); // "YYYY-MM"

  const buckets = new Map<string, SalesDayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    const key = mxDayKey(d);
    buckets.set(key, { key, label: d.toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: MX_TZ }), total: 0, orders: 0 });
  }

  let todayTotal = 0;
  let todayOrders = 0;
  let monthTotal = 0;
  let monthOrders = 0;

  for (const order of orders) {
    const orderDate = new Date(`${order.date_order.replace(" ", "T")}Z`);
    const key = mxDayKey(orderDate);

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.total += order.amount_total;
      bucket.orders += 1;
    }
    if (key === todayKey) {
      todayTotal += order.amount_total;
      todayOrders += 1;
    }
    if (key.startsWith(monthPrefix)) {
      monthTotal += order.amount_total;
      monthOrders += 1;
    }
  }

  return {
    todayTotal,
    todayOrders,
    monthTotal,
    monthOrders,
    avgTicket: monthOrders > 0 ? monthTotal / monthOrders : 0,
    dailySeries: [...buckets.values()],
  };
}

interface RawPosOrderLine {
  product_id: [number, string] | false;
  qty: number;
  price_subtotal_incl: number;
}

export interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

/** Productos más vendidos (por ingreso) en los últimos `days` días. */
export async function fetchTopProducts(days = 30, limit = 8): Promise<TopProduct[]> {
  const cutoff = new Date(Date.now() - days * DAY_MS);

  const lines = await odooSearchRead<RawPosOrderLine>(
    "pos.order.line",
    [["order_id.date_order", ">=", toOdooUtcString(cutoff)]],
    { fields: ["product_id", "qty", "price_subtotal_incl"] },
  );

  const byProduct = new Map<string, TopProduct>();
  for (const line of lines) {
    if (!line.product_id) continue;
    const name = line.product_id[1];
    const current = byProduct.get(name) ?? { name, qty: 0, revenue: 0 };
    current.qty += line.qty;
    current.revenue += line.price_subtotal_incl;
    byProduct.set(name, current);
  }

  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}
