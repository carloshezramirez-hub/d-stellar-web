import type { Learning } from "@/lib/ads/analysis";
import type { EventRecord } from "@/lib/events-types";
import type { SearchQueryRow } from "@/lib/google/search-console";
import type { SalesSummary, TopProduct, WeekdayPoint } from "@/lib/odoo/sales";
import type { WebOrder } from "@/lib/orders-db";
import type { FeedPost } from "@/lib/social/queries";
import type { LoyaltyMember } from "@/lib/wallet/loyalty-db";

export type IdeaSource = "ventas" | "anuncios" | "eventos" | "fidelidad" | "pedidos" | "redes" | "trafico";

export interface Idea {
  id: string;
  source: IdeaSource;
  severity: "win" | "fix" | "watch";
  title: string;
  body: string;
  action: string;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

/** id estable por regla — mismo source+slug siempre que la regla se dispare, para poder guardarle un estado (pendiente/en curso/completada) en Supabase sin depender del texto exacto. */
function ideaId(source: IdeaSource, slug: string): string {
  return `${source}-${slug}`;
}

export interface SalesIdeasInput {
  salesSummary: SalesSummary | null;
  topProducts: TopProduct[];
  weekdayPattern: WeekdayPoint[];
  adsLearnings: Learning[];
  events: EventRecord[];
  webOrders: WebOrder[];
  members: LoyaltyMember[];
  topPost: FeedPost | null;
  searchQueries: SearchQueryRow[];
}

/**
 * Reglas determinísticas (nada de LLM/texto inventado) que cruzan TODAS las
 * fuentes reales ya conectadas al panel — mismo espíritu que
 * lib/ads/analysis.ts buildLearnings(), pero a nivel de todo el negocio en
 * vez de solo una campaña. Cada idea cita un número real; si una fuente no
 * tiene suficientes datos para una idea confiable, simplemente no la agrega
 * (nunca rellena con algo inventado).
 */
export function buildSalesIdeas(input: SalesIdeasInput): Idea[] {
  const ideas: Idea[] = [];

  // --- Ventas (Odoo) ---
  if (input.topProducts.length > 0) {
    const top = input.topProducts[0];
    ideas.push({
      id: ideaId("ventas", "producto-estrella"),
      source: "ventas",
      severity: "win",
      title: `Tu producto estrella es "${top.name}"`,
      body: `Generó ${formatMoney(top.revenue)} (${top.qty.toFixed(0)} unidades) en el periodo seleccionado de Ventas.`,
      action: "Asegúrate de que nunca falte en piso y hazlo protagonista de tu próximo post/anuncio.",
    });
  }

  const daysWithSales = input.weekdayPattern.filter((d) => d.orders > 0);
  if (daysWithSales.length >= 3) {
    const best = [...daysWithSales].sort((a, b) => b.total - a.total)[0];
    const worst = [...daysWithSales].sort((a, b) => a.total - b.total)[0];
    if (best.key !== worst.key) {
      ideas.push({
        id: ideaId("ventas", "dia-flojo"),
        source: "ventas",
        severity: "watch",
        title: `${worst.label} es tu día más flojo`,
        body: `${formatMoney(worst.total)} vs. ${formatMoney(best.total)} de ${best.label} en el mismo periodo.`,
        action: `Concentra una promo o impulso en redes específicamente los ${worst.label.toLowerCase()}.`,
      });
    }
  }

  // --- Anuncios (TikTok Ads) — se toma el primer "win" y el primer "fix" para no repetir toda la lista de /admin/anuncios ---
  const adsWin = input.adsLearnings.find((l) => l.severity === "win");
  if (adsWin) {
    ideas.push({
      id: ideaId("anuncios", "win"),
      source: "anuncios",
      severity: "win",
      title: adsWin.title,
      body: adsWin.body,
      action: "Revisa la campaña en /admin/anuncios y sube su presupuesto.",
    });
  }
  const adsFix = input.adsLearnings.find((l) => l.severity === "fix");
  if (adsFix) {
    ideas.push({
      id: ideaId("anuncios", "fix"),
      source: "anuncios",
      severity: "fix",
      title: adsFix.title,
      body: adsFix.body,
      action: "Corrige el problema antes de volver a promocionar ese video.",
    });
  }

  // --- Eventos ---
  const statsBySlug = new Map<string, { count: number; revenue: number }>();
  for (const order of input.webOrders) {
    if (order.kind !== "ticket" || !order.event_slug) continue;
    const current = statsBySlug.get(order.event_slug) ?? { count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += order.amount_mxn;
    statsBySlug.set(order.event_slug, current);
  }
  const pastWithSales = input.events
    .filter((e) => e.status === "past" && statsBySlug.has(e.slug))
    .map((e) => ({ event: e, stats: statsBySlug.get(e.slug)! }))
    .sort((a, b) => b.stats.revenue - a.stats.revenue);
  if (pastWithSales.length > 0) {
    const bestEvent = pastWithSales[0];
    ideas.push({
      id: ideaId("eventos", "mejor-evento"),
      source: "eventos",
      severity: "win",
      title: `"${bestEvent.event.title}" fue tu evento con más ingreso`,
      body: `${formatMoney(bestEvent.stats.revenue)} en ${bestEvent.stats.count} boletos.`,
      action: "Repite el mismo formato/precio en vez de inventar un concepto nuevo desde cero.",
    });
  }

  const avgPastRevenue = pastWithSales.length > 0 ? pastWithSales.reduce((s, p) => s + p.stats.revenue, 0) / pastWithSales.length : 0;
  const upcomingLagging = input.events
    .filter((e) => e.status === "upcoming")
    .map((e) => ({ event: e, stats: statsBySlug.get(e.slug) ?? { count: 0, revenue: 0 } }))
    .filter((e) => avgPastRevenue > 0 && e.stats.revenue < avgPastRevenue * 0.3);
  if (upcomingLagging.length > 0) {
    const e = upcomingLagging[0];
    ideas.push({
      id: ideaId("eventos", "evento-rezagado"),
      source: "eventos",
      severity: "watch",
      title: `"${e.event.title}" lleva pocos boletos vendidos`,
      body: `Solo ${formatMoney(e.stats.revenue)} vendidos, muy por debajo del promedio de tus eventos pasados (${formatMoney(avgPastRevenue)}).`,
      action: "Empújalo con un post/historia o un anuncio dirigido antes de que sea tarde.",
    });
  }

  // --- Fidelidad ---
  const closeToReward = input.members.filter((m) => m.stamps_required - m.stamps > 0 && m.stamps_required - m.stamps <= 2);
  if (closeToReward.length > 0) {
    ideas.push({
      id: ideaId("fidelidad", "cerca-del-premio"),
      source: "fidelidad",
      severity: "win",
      title: `${closeToReward.length} cliente${closeToReward.length > 1 ? "s están" : " está"} a 1-2 sellos de su premio`,
      body: `Nombres: ${closeToReward.slice(0, 6).map((m) => m.name).join(", ")}${closeToReward.length > 6 ? "…" : ""}.`,
      action: "Mándales un WhatsApp o etiquétalos en una historia invitándolos a volver.",
    });
  }

  if (input.members.length >= 5) {
    const noobies = input.members.filter((m) => m.lifetime_stamps < 10).length;
    const noobiePct = (noobies / input.members.length) * 100;
    if (noobiePct >= 60) {
      ideas.push({
        id: ideaId("fidelidad", "segunda-visita"),
        source: "fidelidad",
        severity: "watch",
        title: `${noobiePct.toFixed(0)}% de tu base nunca pasó de su primer sello`,
        body: "La mayoría se registra pero no vuelve a sellar.",
        action: "Prueba un incentivo para la segunda visita (ej. doble sello).",
      });
    }
  }

  // --- Pedidos web ---
  const needsAttention = input.webOrders.filter(
    (o) => o.email_customer_status === "bounced" || o.email_customer_status === "failed" || o.email_customer_status === "complained",
  );
  if (needsAttention.length > 0) {
    ideas.push({
      id: ideaId("pedidos", "correos-sin-confirmar"),
      source: "pedidos",
      severity: "fix",
      title: `${needsAttention.length} pedido${needsAttention.length > 1 ? "s" : ""} con el correo de confirmación sin llegar`,
      body: "Un cliente sin confirmación puede no presentarse o desconfiar de la compra.",
      action: "Ve a /pedidos y reenvía con el correo corregido.",
    });
  }

  // --- Redes orgánicas ---
  if (input.topPost) {
    const p = input.topPost;
    const platformLabel = p.platform === "tiktok" ? "TikTok" : p.platform === "instagram" ? "Instagram" : "Facebook";
    ideas.push({
      id: ideaId("redes", "mejor-post"),
      source: "redes",
      severity: "win",
      title: `Tu post con mejor desempeño fue en ${platformLabel}`,
      body: p.caption ? `"${p.caption.slice(0, 90)}…"` : "Fue el que más engagement generó frente al resto del periodo.",
      action: "Repite ese mismo formato/tono en vez de improvisar contenido nuevo.",
    });
  }

  // --- Tráfico / Search Console ---
  const discoveryQueries = input.searchQueries
    .filter((q) => !q.query.toLowerCase().includes("stellar"))
    .filter((q) => q.impressions >= 3 && q.clicks === 0 && q.position <= 20)
    .sort((a, b) => b.impressions - a.impressions);
  if (discoveryQueries.length > 0) {
    const q = discoveryQueries[0];
    ideas.push({
      id: ideaId("trafico", "busqueda-sin-clic"),
      source: "trafico",
      severity: "watch",
      title: `Gente busca "${q.query}" y te encuentra, pero no le da clic`,
      body: `Posición ${q.position.toFixed(0)}, ${q.impressions} veces visto, 0 clics.`,
      action: "Revisa el título/descripción de la página que rankea para ese término.",
    });
  }

  return ideas;
}
