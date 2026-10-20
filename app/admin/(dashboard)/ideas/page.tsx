import { ConsoleShell } from "@/components/admin/console-shell";
import { IdeasList } from "@/components/admin/ideas/ideas-list";
import { buildLearnings } from "@/lib/ads/analysis";
import { listAllEvents } from "@/lib/events-db";
import { buildSalesIdeas } from "@/lib/insights/sales-ideas";
import { isOdooConfigured } from "@/lib/odoo/env";
import { fetchSalesSummary, fetchTopProducts, fetchWeekdayPattern } from "@/lib/odoo/sales";
import { listOrders } from "@/lib/orders-db";
import { pickHighlights } from "@/lib/social/kpis";
import { getPostsFeed } from "@/lib/social/queries";
import { listAllLoyaltyMembers } from "@/lib/wallet/loyalty-db";

export default async function IdeasPage() {
  const [salesSummary, topProducts, weekdayPattern, events, webOrders, members, posts] = await Promise.all([
    isOdooConfigured() ? fetchSalesSummary(90) : Promise.resolve(null),
    isOdooConfigured() ? fetchTopProducts(90) : Promise.resolve([]),
    isOdooConfigured() ? fetchWeekdayPattern(90) : Promise.resolve([]),
    listAllEvents(),
    listOrders(1000),
    listAllLoyaltyMembers(),
    getPostsFeed(200).catch(() => []),
  ]);

  const adsLearnings = buildLearnings();
  const { topId } = pickHighlights(posts);
  const topPost = posts.find((p) => p.id === topId) ?? null;

  const ideas = buildSalesIdeas({
    salesSummary,
    topProducts,
    weekdayPattern,
    adsLearnings,
    events,
    webOrders,
    members,
    topPost,
  });

  return (
    <main className="min-h-screen">
      <ConsoleShell />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <p className="mb-1 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Ideas para vender más</p>
        <p className="mb-8 max-w-2xl text-sm text-stellar-white/60">
          Reglas automáticas (no son opiniones ni texto generado) que cruzan Ventas, Anuncios, Eventos, Fidelidad,
          Pedidos y Redes sociales — cada idea cita un número real de tu panel. Mientras más fuentes estén
          conectadas, más ideas aparecen aquí.
        </p>

        <IdeasList ideas={ideas} />
      </div>
    </main>
  );
}
