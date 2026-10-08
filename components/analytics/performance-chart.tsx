"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyPoint } from "@/lib/social/kpis";

function formatDayShort(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function InteractionsChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({ ...d, label: formatDayShort(d.date) }));

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Interacciones por día</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="interactionsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff70e0" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#ff70e0" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#ff70e0" }}
          />
          <Area
            type="monotone"
            dataKey="interactions"
            stroke="#ff70e0"
            strokeWidth={2.5}
            fill="url(#interactionsFill)"
            name="Interacciones"
            activeDot={{ r: 5, fill: "#ff70e0", stroke: "#000", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReachChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({ ...d, label: formatDayShort(d.date) }));

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Alcance por día</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4d63e0" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#4d63e0" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#4d63e0" }}
          />
          <Area
            type="monotone"
            dataKey="reach"
            stroke="#4d63e0"
            strokeWidth={2.5}
            fill="url(#reachFill)"
            name="Alcance"
            activeDot={{ r: 5, fill: "#4d63e0", stroke: "#000", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
