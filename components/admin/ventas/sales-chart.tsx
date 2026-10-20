"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SalesDayPoint } from "@/lib/odoo/sales";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

export function SalesChart({ data }: { data: SalesDayPoint[] }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Ventas de piso por día</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff00" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#00ff00" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatMoney(v)} width={70} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => formatMoney(Number(value))}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#00ff00"
            strokeWidth={2.5}
            fill="url(#salesFill)"
            name="Ventas"
            activeDot={{ r: 5, fill: "#00ff00", stroke: "#000", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
