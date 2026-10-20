import type { ResolvedRange } from "@/lib/admin/date-range";
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

function mxMonthKeyLocal(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MX_TZ, year: "numeric", month: "2-digit" }).format(date);
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
 * Trae ventas de piso (Punto de Venta) y arma el resumen completo. `chartRange`
 * controla qué periodo dibuja la gráfica diaria (el filtro de fecha del
 * dashboard, con límite superior real — necesario para "Mes anterior"/
 * "Personalizado"); "hoy"/"este mes" son SIEMPRE el día/mes calendario real,
 * en una consulta aparte, sin importar qué rango esté viendo el usuario.
 */
export async function fetchSalesSummary(chartRange: ResolvedRange): Promise<SalesSummary> {
  const now = new Date();
  const monthCutoff = new Date(now.getTime() - 35 * DAY_MS); // cubre de sobra el mes calendario actual

  const [chartOrders, recentOrders] = await Promise.all([
    odooSearchRead<RawPosOrder>(
      "pos.order",
      [
        ["date_order", ">=", toOdooUtcString(chartRange.start ?? new Date(now.getTime() - 180 * DAY_MS))],
        ["date_order", "<=", toOdooUtcString(chartRange.end)],
        ["state", "!=", "cancel"],
      ],
      { fields: ["date_order", "amount_total"], order: "date_order asc" },
    ),
    odooSearchRead<RawPosOrder>(
      "pos.order",
      [
        ["date_order", ">=", toOdooUtcString(monthCutoff)],
        ["state", "!=", "cancel"],
      ],
      { fields: ["date_order", "amount_total"] },
    ),
  ]);

  const todayKey = mxDayKey(now);
  const monthPrefix = todayKey.slice(0, 7); // "YYYY-MM"

  let todayTotal = 0;
  let todayOrders = 0;
  let monthTotal = 0;
  let monthOrders = 0;
  for (const order of recentOrders) {
    const key = mxDayKey(new Date(`${order.date_order.replace(" ", "T")}Z`));
    if (key === todayKey) {
      todayTotal += order.amount_total;
      todayOrders += 1;
    }
    if (key.startsWith(monthPrefix)) {
      monthTotal += order.amount_total;
      monthOrders += 1;
    }
  }

  const start = chartRange.start ?? new Date(chartRange.end.getTime() - 179 * DAY_MS);
  // +1ms porque `end` es fin-de-día (23:59:59.999) y `start` es inicio-de-día
  // (00:00:00.000) — sin ese milisegundo, un mes de 30 días calcula 29.999...
  // y Math.round lo sube a 31, corriendo todo el rango un día (confirmado
  // visualmente: "Mes anterior" en septiembre arrancaba el 31 de agosto).
  const dayCount = Math.max(1, Math.round((chartRange.end.getTime() - start.getTime() + 1) / DAY_MS));
  const buckets = new Map<string, SalesDayPoint>();
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(chartRange.end.getTime() - i * DAY_MS);
    const key = mxDayKey(d);
    buckets.set(key, { key, label: d.toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: MX_TZ }), total: 0, orders: 0 });
  }
  for (const order of chartOrders) {
    const key = mxDayKey(new Date(`${order.date_order.replace(" ", "T")}Z`));
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.total += order.amount_total;
      bucket.orders += 1;
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

/** Productos más vendidos (por ingreso) dentro del rango. */
export async function fetchTopProducts(range: ResolvedRange, limit = 10): Promise<TopProduct[]> {
  const start = range.start ?? new Date(range.end.getTime() - 180 * DAY_MS);

  const lines = await odooSearchRead<RawPosOrderLine>(
    "pos.order.line",
    [
      ["order_id.date_order", ">=", toOdooUtcString(start)],
      ["order_id.date_order", "<=", toOdooUtcString(range.end)],
    ],
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

export interface WeekdayPoint {
  key: number; // 0=lunes .. 6=domingo
  label: string;
  total: number;
  orders: number;
  avgTicket: number;
}

const WEEKDAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/** En qué día de la semana vende más la tienda (promedio por venta) — para decidir cuándo reforzar personal/promos. */
export async function fetchWeekdayPattern(range: ResolvedRange): Promise<WeekdayPoint[]> {
  const start = range.start ?? new Date(range.end.getTime() - 180 * DAY_MS);

  const orders = await odooSearchRead<RawPosOrder>(
    "pos.order",
    [
      ["date_order", ">=", toOdooUtcString(start)],
      ["date_order", "<=", toOdooUtcString(range.end)],
      ["state", "!=", "cancel"],
    ],
    { fields: ["date_order", "amount_total"] },
  );

  const buckets = WEEKDAY_LABELS.map((label, key) => ({ key, label, total: 0, orders: 0, avgTicket: 0 }));

  for (const order of orders) {
    const orderDate = new Date(`${order.date_order.replace(" ", "T")}Z`);
    // Intl weekday "1"=lunes..."7"=domingo en formato numérico no existe directo; se deriva del nombre largo en es-MX.
    const weekdayName = new Intl.DateTimeFormat("es-MX", { timeZone: MX_TZ, weekday: "long" }).format(orderDate);
    const idx = WEEKDAY_LABELS.findIndex((l) => l.toLowerCase() === weekdayName.toLowerCase());
    if (idx === -1) continue;
    buckets[idx].total += order.amount_total;
    buckets[idx].orders += 1;
  }

  for (const b of buckets) b.avgTicket = b.orders > 0 ? b.total / b.orders : 0;
  return buckets;
}

export interface MonthlyPoint {
  key: string; // "YYYY-MM"
  label: string;
  total: number;
  orders: number;
  avgTicket: number;
}

/** Evolución mes a mes desde el primer registro real en Odoo (sin cortar por rango — es la serie histórica completa). */
export async function fetchMonthlyTrend(): Promise<MonthlyPoint[]> {
  const orders = await odooSearchRead<RawPosOrder>(
    "pos.order",
    [["state", "!=", "cancel"]],
    { fields: ["date_order", "amount_total"], order: "date_order asc" },
  );

  const buckets = new Map<string, MonthlyPoint>();
  for (const order of orders) {
    const d = new Date(`${order.date_order.replace(" ", "T")}Z`);
    const key = mxMonthKeyLocal(d);
    const current = buckets.get(key) ?? {
      key,
      label: d.toLocaleDateString("es-MX", { month: "short", year: "2-digit", timeZone: MX_TZ }),
      total: 0,
      orders: 0,
      avgTicket: 0,
    };
    current.total += order.amount_total;
    current.orders += 1;
    buckets.set(key, current);
  }

  const points = [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
  for (const p of points) p.avgTicket = p.orders > 0 ? p.total / p.orders : 0;
  return points;
}
