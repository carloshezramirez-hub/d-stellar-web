"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TopProduct } from "@/lib/odoo/sales";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

function shortLabel(name: string) {
  return name.length > 22 ? `${name.slice(0, 22)}…` : name;
}

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  if (data.length === 0) return null;

  const chartData = data.map((p) => ({ ...p, label: shortLabel(p.name) }));

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Productos más vendidos (por ingreso)</p>
      <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 36)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatMoney(v)} />
          <YAxis dataKey="label" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} width={170} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(value) => formatMoney(Number(value))}
          />
          <Bar dataKey="revenue" fill="#ff70e0" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
