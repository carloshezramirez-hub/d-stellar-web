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

export function buildAllEfficiency(campaigns: AdCampaign[] = AD_CAMPAIGNS): CampaignEfficiency[] {
  return campaigns.map(buildEfficiency);
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

export function buildTotals(campaigns: AdCampaign[] = AD_CAMPAIGNS): AdsTotals {
  const totalSpendMXN = campaigns.reduce((sum, c) => sum + c.adCostMXN, 0);
  const totalViews = campaigns.reduce((sum, c) => sum + c.videoViews, 0);
  const totalLikes = campaigns.reduce((sum, c) => sum + c.likes, 0);
  const totalNewFollowers = campaigns.reduce((sum, c) => sum + (c.newFollowers ?? 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.buttonClicks ?? 0), 0);

  return {
    totalSpendMXN,
    totalViews,
    totalLikes,
    totalNewFollowers,
    totalClicks,
    blendedCpmMXN: totalViews > 0 ? (totalSpendMXN / totalViews) * 1000 : 0,
    campaignCount: campaigns.length,
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
  const total = AD_CAMPAIGNS.length;
  const eff = buildAllEfficiency();

  const shortest = [...AD_CAMPAIGNS].sort((a, b) => a.videoDurationSec - b.videoDurationSec)[0];
  const bestCompletion = [...AD_CAMPAIGNS].sort((a, b) => b.retention.watchedFull.value - a.retention.watchedFull.value)[0];

  // "Increase budget" solo tiene sentido sobre campañas que siguen activas —
  // una completada/cerrada con el like rate más alto (p.ej. una vieja que ya
  // se volvió viral) no es una sugerencia accionable de subir presupuesto.
  const activeEff = eff.filter((e) => e.campaign.status === "active");
  const bestLikeRate = [...activeEff].sort((a, b) => b.likeRate - a.likeRate)[0];
  const bestCostPerClick = [...activeEff].filter((e) => e.costPerClick !== null).sort((a, b) => (a.costPerClick ?? Infinity) - (b.costPerClick ?? Infinity))[0];

  const worstCostPerLike = [...eff].filter((e) => e.costPerLike !== null).sort((a, b) => (b.costPerLike ?? 0) - (a.costPerLike ?? 0))[0];

  const narrativeCampaigns = AD_CAMPAIGNS.filter((c) => c.id === "experimento" || c.id === "detras-de-dstellar");
  const promoCampaigns = AD_CAMPAIGNS.filter((c) => c.id !== "experimento" && c.id !== "detras-de-dstellar");
  const avgLikeRateNarrative = narrativeCampaigns.reduce((s, c) => s + (c.likes / c.videoViews) * 100, 0) / narrativeCampaigns.length;
  const avgLikeRatePromo = promoCampaigns.reduce((s, c) => s + (c.likes / c.videoViews) * 100, 0) / promoCampaigns.length;

  const flagged = AD_CAMPAIGNS.filter((c) => c.flaggedIssue);

  const otherDurations = AD_CAMPAIGNS.filter((c) => c.id !== shortest.id).map((c) => c.videoDurationSec);
  const aboveCompletionCount = AD_CAMPAIGNS.filter((c) => c.retention.watchedFull.vsAverage === "above").length;
  const shorterClipsNoteCount = AD_CAMPAIGNS.filter((c) => c.contentAnalysisNote.includes("shorter clips")).length;

  const learnings: Learning[] = [];

  if (aboveCompletionCount === 1 && bestCompletion.id === shortest.id) {
    learnings.push({
      severity: "win",
      title: `Los videos cortos terminan mejor — el de ${shortest.videoDurationSec}s es el único arriba del promedio en finalización completa`,
      body: `"${shortest.videoCaption.slice(0, 40)}…" dura solo ${shortest.videoDurationSec}s y es el único de las ${total} campañas con "Watched full video" por encima del promedio (${bestCompletion.retention.watchedFull.value}%). Los otros ${total - 1} videos (${Math.min(...otherDurations)}s-${Math.max(...otherDurations)}s) quedaron todos por debajo del promedio en finalización. TikTok lo señaló explícitamente en ${shorterClipsNoteCount} de las ${total} campañas ("try shorter clips"). Regla para adelante: apuntar a videos de 20-30s para anuncios, no reusar los más largos.`,
    });
  }

  learnings.push({
    severity: "win",
    title: 'El tono "detrás de cámaras" supera al tono de venta directa',
    body: `Los 2 videos con narrativa de "esto es un experimento/les enseñamos lo que pasa detrás del negocio" (${narrativeCampaigns.map((c) => `"${c.videoCaption.slice(0, 25)}…"`).join(" y ")}) promedian ${avgLikeRateNarrative.toFixed(2)}% de like rate, contra ${avgLikeRatePromo.toFixed(2)}% de los videos de venta directa/listicle de las otras ${promoCampaigns.length} campañas ("top 5 cookies" x2, "reserva desde...", "nació de una idea"). Nota: no incluye la 2ª ronda de "experimento" (misma pieza, orden distinta) para no comparar un video contra sí mismo. Regla para adelante: priorizar guiones de detrás-de-cámaras/storytelling del negocio sobre videos tipo catálogo.`,
  });

  // Comparación de "a cuál de las activas subirle presupuesto" solo tiene
  // sentido con 2+ campañas activas a la vez — con 1 sola activa, ganar por
  // default no es una señal real (y si esa única activa tiene una nota de
  // contenido negativa de TikTok, decir "win" sería engañoso).
  if (bestLikeRate && activeEff.length >= 2 && !bestLikeRate.campaign.contentAnalysisNote.toLowerCase().includes("isn't doing as well")) {
    learnings.push({
      severity: "win",
      title: `"Increase budget" en "${bestLikeRate.campaign.videoCaption.slice(0, 30)}…" — la propia sugerencia de TikTok coincide con los datos`,
      body: `De las campañas activas ahora mismo, esta tiene el like rate más alto (${bestLikeRate.likeRate.toFixed(2)}%)${bestCostPerClick ? ` y el mejor costo por click entre ellas (${bestCostPerClick.campaign.id === bestLikeRate.campaign.id ? `$${bestCostPerClick.costPerClick?.toFixed(2)} MXN` : `no es la más barata en clicks (esa es "${bestCostPerClick.campaign.videoCaption.slice(0, 20)}…")`})` : ""} — ${bestLikeRate.campaign.newFollowers ?? 0} seguidores nuevos y ${bestLikeRate.campaign.shares ?? 0} compartidos hasta ahora. Vale la pena ponerle más presupuesto antes que probar campañas nuevas desde cero.`,
    });
  }

  if (worstCostPerLike) {
    const audienceDesc = worstCostPerLike.campaign.audienceRegion === "cdmx-100" ? "audiencia correcta (100% CDMX)" : "audiencia mixta/amplia (no concentrada en CDMX)";
    learnings.push({
      severity: "watch",
      title: `Costo por like disparado en "${worstCostPerLike.campaign.videoCaption.slice(0, 30)}…" ($${worstCostPerLike.costPerLike?.toFixed(2)} MXN/like)`,
      body: `Con ${audienceDesc} pero like rate de solo ${worstCostPerLike.likeRate.toFixed(2)}%, el problema aquí no es (solo) a quién le llegó sino qué tan poco invita el video a interactuar — coincide con la nota de TikTok ("${worstCostPerLike.campaign.contentAnalysisNote.slice(0, 70)}…"). Vale la pena agregar un llamado a la acción visual tipo "dale like si..." en los próximos cortes.`,
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
      title: `"${completed.videoCaption.slice(0, 30)}…" ($${completed.adCostMXN} MXN) siguió generando resultados 7 días después de terminar`,
      body: `Generó ${completed.postCampaign7d.videoViews} reproducciones orgánicas extra, ${completed.postCampaign7d.profileViews} visitas a perfil y ${completed.postCampaign7d.likes} likes en la semana posterior a que terminó el presupuesto — más ${completed.postCampaign7d.topFollowers.length} seguidores identificados como "más fieles" (${completed.postCampaign7d.topFollowers.map((f) => `@${f.handle}`).join(", ")}). Confirma que concentrar presupuesto en un video ya probado rinde más que repartirlo en varias pruebas chicas.`,
    });
  }

  return learnings;
}
