"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChannelPoint } from "@/lib/google/analytics";

const CHANNEL_LABEL: Record<string, string> = {
  Direct: "Directo",
  "Organic Search": "Búsqueda orgánica",
  "Organic Social": "Redes sociales",
  Referral: "Referidos",
  "Paid Social": "Anuncios sociales",
  "AI Assistant": "Asistentes de IA",
  Unassigned: "Sin clasificar",
};

export function ChannelChart({ data }: { data: ChannelPoint[] }) {
  if (data.length === 0) return null;

  const chartData = data.map((c) => ({ ...c, label: CHANNEL_LABEL[c.channel] ?? c.channel }));

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">De dónde viene la gente</p>
      <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 32)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis dataKey="label" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} width={130} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="sessions" fill="#a21ffe" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
