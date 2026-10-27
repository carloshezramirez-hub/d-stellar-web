import { ConsoleShell } from "@/components/admin/console-shell";
import { IdeasBoard } from "@/components/admin/ideas/ideas-board";
import { resolveDateRange, withinRange } from "@/lib/admin/date-range";
import { buildLearnings } from "@/lib/ads/analysis";
import { listAllEvents } from "@/lib/events-db";
import { isSearchConsoleConfigured } from "@/lib/google/env";
import { fetchSearchSummary } from "@/lib/google/search-console";
import { listIdeaStatuses } from "@/lib/insights/idea-status-db";
import { buildSalesIdeas } from "@/lib/insights/sales-ideas";
import { isOdooConfigured } from "@/lib/odoo/env";
import { fetchSalesSummary, fetchTopProducts, fetchWeekdayPattern } from "@/lib/odoo/sales";
import { listOrders } from "@/lib/orders-db";
import { pickHighlights } from "@/lib/social/kpis";
import { getPostsFeed } from "@/lib/social/queries";
import { listAllLoyaltyMembers } from "@/lib/wallet/loyalty-db";

export default async function IdeasPage() {
  const range = resolveDateRange("90", "90");

  const [salesSummary, topProducts, weekdayPattern, events, webOrders, members, posts, search, statuses] = await Promise.all([
    isOdooConfigured() ? fetchSalesSummary(range) : Promise.resolve(null),
    isOdooConfigured() ? fetchTopProducts(range) : Promise.resolve([]),
    isOdooConfigured() ? fetchWeekdayPattern(range) : Promise.resolve([]),
    listAllEvents(),
    listOrders(1000),
    listAllLoyaltyMembers(),
    getPostsFeed(200).catch(() => []),
    isSearchConsoleConfigured() ? fetchSearchSummary(range) : Promise.resolve(null),
    listIdeaStatuses(),
  ]);

  const adsLearnings = buildLearnings();
  // "Mejor post" se calcula solo sobre los últimos 30 días — con el feed
  // completo (200 posts, meses de historia) un post viejo con engagement
  // rate alto se queda ganando para siempre y la idea deja de sentirse
  // "fresca" semana a semana. 90 días (el `range` que usan Ventas/Tráfico)
  // no alcanzaba a excluir al post que llevaba semanas ganando; 30 sí.
  const recentRange = resolveDateRange("30", "30");
  const recentPosts = posts.filter((p) => p.postedAt !== null && withinRange(p.postedAt, recentRange));
  const { topId } = pickHighlights(recentPosts);
  const topPost = recentPosts.find((p) => p.id === topId) ?? null;

  const ideas = buildSalesIdeas({
    salesSummary,
    topProducts,
    weekdayPattern,
    adsLearnings,
    events,
    webOrders,
    members,
    topPost,
    searchQueries: search?.topQueries ?? [],
  });

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-1 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Ideas para vender más</p>
        <p className="mb-8 max-w-2xl text-sm text-stellar-white/60">
          Reglas automáticas que cruzan Ventas, Anuncios, Eventos, Fidelidad, Pedidos, Redes y Tráfico — cada idea
          cita un número real. Marca su estado cuando la pongas en marcha.
        </p>

        <IdeasBoard ideas={ideas} statuses={statuses} />
      </div>
    </main>
  );
}
