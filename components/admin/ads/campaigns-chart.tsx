"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdCampaign } from "@/data/ads-campaigns";
import type { CampaignEfficiency } from "@/lib/ads/analysis";

const STATUS_COLOR: Record<AdCampaign["status"], string> = {
  active: "#00ff00",
  closed: "rgba(255,255,255,0.35)",
  completed: "#243ad2",
};

function shortLabel(caption: string) {
  const words = caption.split(" ").slice(0, 2).join(" ");
  return words.length < caption.length ? `${words}…` : words;
}

export function CampaignsChart({ efficiencies }: { efficiencies: CampaignEfficiency[] }) {
  const viewsData = efficiencies.map((e) => ({
    label: shortLabel(e.campaign.videoCaption),
    reproducciones: e.campaign.videoViews,
    status: e.campaign.status,
  }));
  const likeRateData = efficiencies.map((e) => ({
    label: shortLabel(e.campaign.videoCaption),
    likeRate: Number(e.likeRate.toFixed(2)),
    status: e.campaign.status,
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-line p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Reproducciones por campaña</p>
        <p className="mb-4 flex gap-3 text-[10px] text-stellar-white/35">
          <span>🟢 activa</span>
          <span>🔵 completada</span>
          <span>⚪ cerrada</span>
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={viewsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} interval={0} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
              labelStyle={{ color: "#fff" }}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="reproducciones" radius={[4, 4, 0, 0]}>
              {viewsData.map((d, i) => (
                <Cell key={i} fill={STATUS_COLOR[d.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-line p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Like rate por campaña</p>
        <p className="mb-4 text-[10px] text-stellar-white/35">% de likes sobre reproducciones — la métrica que más distingue a la ganadora</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={likeRateData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} interval={0} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} unit="%" />
            <Tooltip
              contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6 }}
              labelStyle={{ color: "#fff" }}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="likeRate" fill="#ff70e0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
