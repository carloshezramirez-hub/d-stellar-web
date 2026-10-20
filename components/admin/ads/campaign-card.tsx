import type { AdCampaign } from "@/data/ads-campaigns";
import type { CampaignEfficiency } from "@/lib/ads/analysis";

const STATUS_STYLE: Record<AdCampaign["status"], string> = {
  active: "border-stellar-green text-stellar-green",
  closed: "border-stellar-white/30 text-stellar-white/50",
  completed: "border-stellar-blue text-stellar-blue",
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("es-MX").format(n);
}

function RetentionBar({ label, value, vsAverage }: { label: string; value: number; vsAverage: "above" | "below" }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[11px]">
        <span className="text-stellar-white/60">{label}</span>
        <span className={`font-bold ${vsAverage === "above" ? "text-stellar-green" : "text-stellar-red"}`}>
          {value}% {vsAverage === "above" ? "▲ sobre el promedio" : "▼ bajo el promedio"}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(value, 2)}%`,
            background: vsAverage === "above" ? "var(--color-stellar-green)" : "var(--color-stellar-red)",
          }}
        />
      </div>
    </div>
  );
}

export function CampaignCard({ campaign, efficiency }: { campaign: AdCampaign; efficiency: CampaignEfficiency }) {
  const mins = Math.floor(campaign.videoDurationSec / 60);
  const secs = campaign.videoDurationSec % 60;
  const durationLabel = mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;

  return (
    <div className="rounded-lg border border-line p-6 transition-colors hover:border-stellar-white/30">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLE[campaign.status]}`}>
          {campaign.statusLabel}
        </span>
        <span className="text-[10px] text-stellar-white/40">
          {new Date(campaign.startedAt).toLocaleDateString("es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "short" })} ·{" "}
          {durationLabel} · {campaign.targeting}
        </span>
      </div>

      <p className="mb-5 line-clamp-3 text-sm text-stellar-white/80">{campaign.videoCaption}</p>

      {campaign.flaggedIssue && (
        <p className="mb-5 rounded border border-stellar-red/40 bg-stellar-red/5 p-3 text-xs text-stellar-red">
          ⚠️ {campaign.flaggedIssue}
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="font-demi text-xl font-bold">{formatMoney(campaign.adCostMXN)}</p>
          <p className="text-[11px] text-stellar-white/50">gasto</p>
        </div>
        <div>
          <p className="font-demi text-xl font-bold">{formatNumber(campaign.videoViews)}</p>
          <p className="text-[11px] text-stellar-white/50">reproducciones</p>
        </div>
        <div>
          <p className="font-demi text-xl font-bold">{formatNumber(campaign.likes)}</p>
          <p className="text-[11px] text-stellar-white/50">me gusta</p>
        </div>
        <div>
          <p className="font-demi text-xl font-bold">{campaign.buttonClicks ?? "—"}</p>
          <p className="text-[11px] text-stellar-white/50">clics al botón</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
        <div>
          <p className="text-sm font-bold">{formatMoney(campaign.cpmMXN)}</p>
          <p className="text-[11px] text-stellar-white/50">CPM</p>
        </div>
        <div>
          <p className="text-sm font-bold">{efficiency.costPerLike !== null ? formatMoney(efficiency.costPerLike) : "—"}</p>
          <p className="text-[11px] text-stellar-white/50">costo / like</p>
        </div>
        <div>
          <p className="text-sm font-bold">{efficiency.costPerClick !== null ? formatMoney(efficiency.costPerClick) : "—"}</p>
          <p className="text-[11px] text-stellar-white/50">costo / clic</p>
        </div>
        <div>
          <p className="text-sm font-bold">{campaign.newFollowers ?? "—"}</p>
          <p className="text-[11px] text-stellar-white/50">seguidores nuevos</p>
        </div>
      </div>

      <div className="mb-5 grid gap-2.5 border-t border-line pt-4">
        <RetentionBar label="Vieron 2 segundos" {...campaign.retention.watched2s} />
        <RetentionBar label="Vieron 6 segundos" {...campaign.retention.watched6s} />
        <RetentionBar label="Vieron el video completo" {...campaign.retention.watchedFull} />
        <RetentionBar label="Like rate" {...campaign.retention.likeRate} />
      </div>

      <p className="border-t border-line pt-3 text-xs leading-relaxed text-stellar-white/50">
        <span className="font-bold text-stellar-white/70">Análisis de TikTok: </span>
        {campaign.contentAnalysisNote}
      </p>

      {campaign.closedManuallyReason && (
        <p className="mt-3 rounded border border-line bg-white/[0.02] p-3 text-xs text-stellar-white/60">
          <span className="font-bold text-stellar-white/80">Por qué se cerró: </span>
          {campaign.closedManuallyReason}
        </p>
      )}

      {campaign.postCampaign7d && (
        <div className="mt-3 rounded border border-stellar-blue/30 bg-stellar-blue/5 p-3 text-xs">
          <p className="mb-1 font-bold text-stellar-blue">Resumen 7 días después de terminar</p>
          <p className="text-stellar-white/70">
            {campaign.postCampaign7d.videoViews} reproducciones orgánicas extra · {campaign.postCampaign7d.profileViews} visitas a
            perfil · {campaign.postCampaign7d.likes} likes · seguidores más fieles:{" "}
            {campaign.postCampaign7d.topFollowers.map((f) => `@${f.handle}`).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
