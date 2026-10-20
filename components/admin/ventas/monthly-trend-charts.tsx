"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyPoint } from "@/lib/odoo/sales";

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

export function AvgTicketTrendChart({ data }: { data: MonthlyPoint[] }) {
  if (data.length === 0) return null;
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Evolución del ticket promedio</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="avgTicketFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a21ffe" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#a21ffe" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatMoney(v)} width={60} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
            formatter={(value) => formatMoney(Number(value))}
          />
          <Area type="monotone" dataKey="avgTicket" stroke="#a21ffe" strokeWidth={2.5} fill="url(#avgTicketFill)" name="Ticket promedio" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyRevenueChart({ data }: { data: MonthlyPoint[] }) {
  if (data.length === 0) return null;
  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Ingresos mensuales</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatMoney(v)} width={60} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(value) => formatMoney(Number(value))}
          />
          <Bar dataKey="total" name="Ingresos" fill="#00ff00" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
