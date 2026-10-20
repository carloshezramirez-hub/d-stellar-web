"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeekdayPoint } from "@/lib/odoo/sales";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

/** Resalta el mejor y peor día — esta gráfica existe para responder "¿qué día meto más personal/promos?", no solo para decorar. */
export function WeekdayChart({ data }: { data: WeekdayPoint[] }) {
  const withSales = data.filter((d) => d.orders > 0);
  if (withSales.length === 0) return null;

  const best = [...withSales].sort((a, b) => b.total - a.total)[0];
  const worst = [...withSales].sort((a, b) => a.total - b.total)[0];

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Ventas por día de la semana</p>
      <p className="mb-4 text-[11px] text-stellar-white/35">
        Para decidir cuándo reforzar personal o lanzar una promo — <span className="text-stellar-green">{best.label}</span> es tu
        mejor día, <span className="text-stellar-red">{worst.label}</span> el más flojo.
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} interval={0} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatMoney(v)} width={70} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(value) => formatMoney(Number(value))}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.key}
                fill={d.key === best.key ? "#00ff00" : d.key === worst.key ? "#fc000f" : "rgba(255,255,255,0.25)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
