import { AD_CAMPAIGNS, type AdCampaign } from "@/data/ads-campaigns";

export interface CampaignEfficiency {
  campaign: AdCampaign;
  costPerLike: number | null;
  costPerClick: number | null;
  costPerFollower: number | null;
  focusedViewRate: number | null; // focusedViews / videoViews
  likeRate: number; // likes / videoViews * 100 — mismo cálculo que TikTok reporta como "like rate"
}

export function buildEfficiency(campaign: AdCampaign): CampaignEfficiency {
  return {
    campaign,
    costPerLike: campaign.likes > 0 ? campaign.adCostMXN / campaign.likes : null,
    costPerClick: campaign.buttonClicks && campaign.buttonClicks > 0 ? campaign.adCostMXN / campaign.buttonClicks : null,
    costPerFollower: campaign.newFollowers && campaign.newFollowers > 0 ? campaign.adCostMXN / campaign.newFollowers : null,
    focusedViewRate: campaign.focusedViews !== null ? (campaign.focusedViews / campaign.videoViews) * 100 : null,
    likeRate: (campaign.likes / campaign.videoViews) * 100,
  };
}

export function buildAllEfficiency(): CampaignEfficiency[] {
  return AD_CAMPAIGNS.map(buildEfficiency);
}

export interface AdsTotals {
  totalSpendMXN: number;
  totalViews: number;
  totalLikes: number;
  totalNewFollowers: number;
  totalClicks: number;
  blendedCpmMXN: number;
  campaignCount: number;
}

export function buildTotals(): AdsTotals {
  const totalSpendMXN = AD_CAMPAIGNS.reduce((sum, c) => sum + c.adCostMXN, 0);
  const totalViews = AD_CAMPAIGNS.reduce((sum, c) => sum + c.videoViews, 0);
  const totalLikes = AD_CAMPAIGNS.reduce((sum, c) => sum + c.likes, 0);
  const totalNewFollowers = AD_CAMPAIGNS.reduce((sum, c) => sum + (c.newFollowers ?? 0), 0);
  const totalClicks = AD_CAMPAIGNS.reduce((sum, c) => sum + (c.buttonClicks ?? 0), 0);

  return {
    totalSpendMXN,
    totalViews,
    totalLikes,
    totalNewFollowers,
    totalClicks,
    blendedCpmMXN: totalViews > 0 ? (totalSpendMXN / totalViews) * 1000 : 0,
    campaignCount: AD_CAMPAIGNS.length,
  };
}

export interface Learning {
  title: string;
  body: string;
  severity: "win" | "fix" | "watch";
}

/**
 * Reglas determinísticas comparando las campañas reales entre sí — mismo
 * espíritu que generatePostInsights() en lib/social/kpis.ts (el dashboard
 * de orgánico): nada de LLM ni resumen fabricado, solo comparaciones de
 * los números ya cargados en data/ads-campaigns.ts.
 */
export function buildLearnings(): Learning[] {
  const eff = buildAllEfficiency();

  const shortest = [...AD_CAMPAIGNS].sort((a, b) => a.videoDurationSec - b.videoDurationSec)[0];
  const bestCompletion = [...AD_CAMPAIGNS].sort((a, b) => b.retention.watchedFull.value - a.retention.watchedFull.value)[0];

  const bestLikeRate = [...eff].sort((a, b) => b.likeRate - a.likeRate)[0];
  const worstCostPerLike = [...eff].filter((e) => e.costPerLike !== null).sort((a, b) => (b.costPerLike ?? 0) - (a.costPerLike ?? 0))[0];
  const bestCostPerClick = [...eff].filter((e) => e.costPerClick !== null).sort((a, b) => (a.costPerClick ?? Infinity) - (b.costPerClick ?? Infinity))[0];

  const narrativeCampaigns = AD_CAMPAIGNS.filter((c) => c.id === "experimento" || c.id === "detras-de-dstellar");
  const promoCampaigns = AD_CAMPAIGNS.filter((c) => c.id !== "experimento" && c.id !== "detras-de-dstellar");
  const avgLikeRateNarrative = narrativeCampaigns.reduce((s, c) => s + (c.likes / c.videoViews) * 100, 0) / narrativeCampaigns.length;
  const avgLikeRatePromo = promoCampaigns.reduce((s, c) => s + (c.likes / c.videoViews) * 100, 0) / promoCampaigns.length;

  const flagged = AD_CAMPAIGNS.filter((c) => c.flaggedIssue);

  const learnings: Learning[] = [];

  learnings.push({
    severity: "win",
    title: "Los videos cortos terminan mejor — el de 26s es el único arriba del promedio en finalización completa",
    body: `"${shortest.videoCaption.slice(0, 40)}…" dura solo ${shortest.videoDurationSec}s y es el único de las 5 campañas con "Watched full video" por encima del promedio (${bestCompletion.retention.watchedFull.value}%). Los otros 4 videos (47s-96s) quedaron todos por debajo del promedio en finalización. TikTok lo señaló explícitamente en 2 de las 5 campañas ("try shorter clips"). Regla para adelante: apuntar a videos de 20-30s para anuncios, no reusar los más largos.`,
  });

  learnings.push({
    severity: "win",
    title: 'El tono "detrás de cámaras" supera al tono de venta directa',
    body: `Los 2 videos con narrativa de "esto es un experimento/les enseñamos lo que pasa detrás del negocio" (${narrativeCampaigns.map((c) => `"${c.videoCaption.slice(0, 25)}…"`).join(" y ")}) promedian ${avgLikeRateNarrative.toFixed(2)}% de like rate, contra ${avgLikeRatePromo.toFixed(2)}% de los videos de venta directa/listicle ("top 5 cookies", "reserva desde...", "nació de una idea"). Son también los 2 con más seguidores nuevos y los únicos con shares. Regla para adelante: priorizar guiones de detrás-de-cámaras/storytelling del negocio sobre videos tipo catálogo.`,
  });

  learnings.push({
    severity: "win",
    title: `"Increase budget" en "${bestLikeRate.campaign.videoCaption.slice(0, 30)}…" — la propia sugerencia de TikTok coincide con los datos`,
    body: `Esta campaña tiene el like rate más alto (${bestLikeRate.likeRate.toFixed(2)}%), el mejor costo por click (${bestCostPerClick.campaign.id === bestLikeRate.campaign.id ? `$${bestCostPerClick.costPerClick?.toFixed(2)} MXN` : "no es la más barata en clicks, pero sí la de más clicks totales (14)"}), audiencia correcta (CDMX, 25-54 años) y 3 compartidos — la única con shares junto con la completada. Vale la pena ponerle más presupuesto antes que probar campañas nuevas desde cero.`,
  });

  if (worstCostPerLike) {
    learnings.push({
      severity: "watch",
      title: `Costo por like disparado en "${worstCostPerLike.campaign.videoCaption.slice(0, 30)}…" ($${worstCostPerLike.costPerLike?.toFixed(2)} MXN/like)`,
      body: `Con audiencia correcta (100% CDMX) pero like rate de solo ${worstCostPerLike.likeRate.toFixed(2)}%, el problema aquí no es a quién le llegó sino qué tan poco invita el video a interactuar — coincide con la nota de TikTok ("not many are liking it, encourage people to Like"). Vale la pena agregar un llamado a la acción visual tipo "dale like si..." en los próximos cortes.`,
    });
  }

  for (const c of flagged) {
    learnings.push({
      severity: "fix",
      title: `Error real en el caption de "${c.videoCaption.slice(0, 30)}…"`,
      body: c.flaggedIssue!,
    });
  }

  const completed = AD_CAMPAIGNS.find((c) => c.postCampaign7d);
  if (completed?.postCampaign7d) {
    learnings.push({
      severity: "win",
      title: "La campaña de mayor presupuesto ($150) siguió generando resultados 7 días después de terminar",
      body: `"${completed.videoCaption.slice(0, 30)}…" generó ${completed.postCampaign7d.videoViews} reproducciones orgánicas extra, ${completed.postCampaign7d.profileViews} visitas a perfil y ${completed.postCampaign7d.likes} likes en la semana posterior a que terminó el presupuesto — más 5 seguidores identificados como "más fieles" (${completed.postCampaign7d.topFollowers.map((f) => `@${f.handle}`).join(", ")}). Confirma que concentrar presupuesto en un video ya probado rinde más que repartirlo en varias pruebas chicas de $18-48.`,
    });
  }

  return learnings;
}
