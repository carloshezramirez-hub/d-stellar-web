"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyPoint } from "@/lib/social/kpis";

function formatDayShort(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function InteractionsChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({ ...d, label: formatDayShort(d.date) }));

  return (
    <div className="rounded border border-line p-4">
      <p className="mb-4 text-xs uppercase tracking-widest text-stellar-white/50">Interacciones por día</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 4 }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#ff70e0" }}
          />
          <Bar dataKey="interactions" fill="#ff70e0" radius={[2, 2, 0, 0]} name="Interacciones" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReachChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({ ...d, label: formatDayShort(d.date) }));

  return (
    <div className="rounded border border-line p-4">
      <p className="mb-4 text-xs uppercase tracking-widest text-stellar-white/50">Alcance por día</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 4 }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#243ad2" }}
          />
          <Line type="monotone" dataKey="reach" stroke="#4d63e0" strokeWidth={2} dot={false} name="Alcance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
