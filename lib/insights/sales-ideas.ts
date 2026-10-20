import type { Learning } from "@/lib/ads/analysis";
import type { EventRecord } from "@/lib/events-types";
import type { SalesSummary, TopProduct, WeekdayPoint } from "@/lib/odoo/sales";
import type { WebOrder } from "@/lib/orders-db";
import type { FeedPost } from "@/lib/social/queries";
import type { LoyaltyMember } from "@/lib/wallet/loyalty-db";

export interface Idea {
  source: "ventas" | "anuncios" | "eventos" | "fidelidad" | "pedidos" | "redes";
  severity: "win" | "fix" | "watch";
  title: string;
  body: string;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
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
      source: "ventas",
      severity: "win",
      title: `Tu producto estrella es "${top.name}"`,
      body: `Generó ${formatMoney(top.revenue)} (${top.qty.toFixed(0)} unidades) en el periodo seleccionado de Ventas. Asegúrate de que nunca falte en piso y que sea protagonista en tus próximos posts/anuncios — ya sabes que vende.`,
    });
  }

  const daysWithSales = input.weekdayPattern.filter((d) => d.orders > 0);
  if (daysWithSales.length >= 3) {
    const best = [...daysWithSales].sort((a, b) => b.total - a.total)[0];
    const worst = [...daysWithSales].sort((a, b) => a.total - b.total)[0];
    if (best.key !== worst.key) {
      ideas.push({
        source: "ventas",
        severity: "watch",
        title: `${worst.label} es tu día más flojo (${formatMoney(worst.total)} vs. ${formatMoney(best.total)} de ${best.label})`,
        body: `En vez de repartir presupuesto de anuncios parejo entre toda la semana, prueba concentrar una promo o impulso en redes específicamente los ${worst.label.toLowerCase()} — es donde más margen hay para crecer.`,
      });
    }
  }

  // --- Anuncios (TikTok Ads) — se toma el primer "win" y el primer "fix" para no repetir toda la lista de /admin/anuncios ---
  const adsWin = input.adsLearnings.find((l) => l.severity === "win");
  if (adsWin) ideas.push({ source: "anuncios", severity: "win", title: adsWin.title, body: adsWin.body });
  const adsFix = input.adsLearnings.find((l) => l.severity === "fix");
  if (adsFix) ideas.push({ source: "anuncios", severity: "fix", title: adsFix.title, body: adsFix.body });

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
      source: "eventos",
      severity: "win",
      title: `"${bestEvent.event.title}" fue tu evento con más ingreso (${formatMoney(bestEvent.stats.revenue)}, ${bestEvent.stats.count} boletos)`,
      body: `Si funcionó una vez, probablemente funcione otra — vale la pena repetir el formato (mismo tipo de experiencia/precio) en vez de inventar un concepto nuevo desde cero cada vez.`,
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
      source: "eventos",
      severity: "watch",
      title: `"${e.event.title}" lleva pocos boletos vendidos para estar tan cerca`,
      body: `Solo ${formatMoney(e.stats.revenue)} vendidos hasta ahora, muy por debajo del promedio de tus eventos pasados (${formatMoney(avgPastRevenue)}) — vale la pena empujarlo con un post/historia o un anuncio dirigido antes de que sea tarde.`,
    });
  }

  // --- Fidelidad ---
  const closeToReward = input.members.filter((m) => m.stamps_required - m.stamps > 0 && m.stamps_required - m.stamps <= 2);
  if (closeToReward.length > 0) {
    ideas.push({
      source: "fidelidad",
      severity: "win",
      title: `${closeToReward.length} cliente${closeToReward.length > 1 ? "s están" : " está"} a 1-2 sellos de su premio`,
      body: `Un mensaje directo (WhatsApp o historia etiquetándolos) invitándolos a volver por su recompensa suele traerlos de regreso antes de que se les olvide la tarjeta. Nombres: ${closeToReward.slice(0, 6).map((m) => m.name).join(", ")}${closeToReward.length > 6 ? "…" : ""}.`,
    });
  }

  if (input.members.length >= 5) {
    const noobies = input.members.filter((m) => m.lifetime_stamps < 10).length;
    const noobiePct = (noobies / input.members.length) * 100;
    if (noobiePct >= 60) {
      ideas.push({
        source: "fidelidad",
        severity: "watch",
        title: `${noobiePct.toFixed(0)}% de tu base de fidelidad nunca pasó de su primer sello`,
        body: `La mayoría de la gente se registra pero no vuelve a sellar. Vale la pena un incentivo para la "segunda visita" (ej. doble sello la segunda vez) en vez de solo enfocarte en registrar gente nueva.`,
      });
    }
  }

  // --- Pedidos web ---
  const needsAttention = input.webOrders.filter(
    (o) => o.email_customer_status === "bounced" || o.email_customer_status === "failed" || o.email_customer_status === "complained",
  );
  if (needsAttention.length > 0) {
    ideas.push({
      source: "pedidos",
      severity: "fix",
      title: `${needsAttention.length} pedido${needsAttention.length > 1 ? "s" : ""} con el correo de confirmación sin llegar`,
      body: `Un cliente que no recibió su confirmación de boleto/pickup puede no presentarse o desconfiar de la compra. Revisa /pedidos y usa el botón de reenviar con el correo corregido.`,
    });
  }

  // --- Redes orgánicas ---
  if (input.topPost) {
    const p = input.topPost;
    ideas.push({
      source: "redes",
      severity: "win",
      title: `Tu post con mejor desempeño fue en ${p.platform === "tiktok" ? "TikTok" : p.platform === "instagram" ? "Instagram" : "Facebook"}`,
      body: `${p.caption ? `"${p.caption.slice(0, 90)}…"` : "Sin caption registrado"} — fue el que más engagement generó frente al resto de tus posts del periodo. Repetir ese mismo formato/tono es más confiable que improvisar contenido nuevo cada vez.`,
    });
  }

  return ideas;
}
