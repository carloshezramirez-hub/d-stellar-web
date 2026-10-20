"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SearchDayPoint } from "@/lib/google/search-console";

export function SearchTrendChart({ data }: { data: SearchDayPoint[] }) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Impresiones y clics en Google por día</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="impressionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff70e0" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#ff70e0" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
          />
          <Area type="monotone" dataKey="impressions" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} fill="url(#impressionsFill)" name="Impresiones" />
          <Area type="monotone" dataKey="clicks" stroke="#ff70e0" strokeWidth={2.5} fill="url(#clicksFill)" name="Clics" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
