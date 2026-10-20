import Link from "next/link";
import { Sparkles, BarChart3, Megaphone, CalendarDays, ShoppingBag, Store, Lightbulb, Globe } from "lucide-react";
import { ConsoleShell } from "@/components/admin/console-shell";
import { HomeFinanceOverview } from "@/components/admin/home-finance-overview";
import { HomeSectionSummary, type SectionSummaryData } from "@/components/admin/home-section-summary";
import { StarField } from "@/components/ui/star-field";
import { isCurrentMonth, resolveDateRange, withinRange } from "@/lib/admin/date-range";
import { SECTION_ORDER, SECTION_THEME, type SectionKey } from "@/lib/admin/section-theme";
import { buildLearnings, buildTotals } from "@/lib/ads/analysis";
import { listAllEvents } from "@/lib/events-db";
import { fetchTrafficSummary } from "@/lib/google/analytics";
import { isGa4Configured, isSearchConsoleConfigured } from "@/lib/google/env";
import { fetchSearchSummary } from "@/lib/google/search-console";
import { buildSalesIdeas } from "@/lib/insights/sales-ideas";
import { isOdooConfigured } from "@/lib/odoo/env";
import { fetchSalesSummary, fetchTopProducts, fetchWeekdayPattern } from "@/lib/odoo/sales";
import { listOrders } from "@/lib/orders-db";
import { pickHighlights } from "@/lib/social/kpis";
import { getLatestAccountStats, getPostsFeed } from "@/lib/social/queries";
import { listAllLoyaltyMembers } from "@/lib/wallet/loyalty-db";

const SECTION_ICON: Record<SectionKey, typeof Sparkles> = {
  ideas: Lightbulb,
  ventas: Store,
  redes: BarChart3,
  trafico: Globe,
  anuncios: Megaphone,
  eventos: CalendarDays,
  pedidos: ShoppingBag,
  fidelidad: Sparkles,
};

const SECTION_DESCRIPTION: Record<SectionKey, string> = {
  ideas: "Recomendaciones automáticas cruzando Ventas, Anuncios, Eventos, Fidelidad y Redes.",
  ventas: "Ventas reales de piso (Punto de Venta), directo de Odoo.",
  redes: "Crecimiento orgánico en Instagram, Facebook y TikTok — qué posts funcionan.",
  trafico: "Google Analytics + Search Console — quién llega al sitio y qué busca para encontrarte.",
  anuncios: "Campañas pagadas de TikTok Ads — qué funcionó, qué corregir.",
  eventos: "Crear/editar eventos, marcar sesiones agotadas, ver quién ya pagó.",
  pedidos: "Historial de compras — boletos y pickup, con estado de entrega.",
  fidelidad: "Escanear tarjetas, sumar sellos y ver la base de clientes.",
};

const ACCENT_STYLE: Record<string, { ring: string; iconBg: string; icon: string }> = {
  blue: { ring: "hover:border-stellar-blue", iconBg: "bg-stellar-blue/15", icon: "text-stellar-blue" },
  pink: { ring: "hover:border-stellar-pink", iconBg: "bg-stellar-pink/15", icon: "text-stellar-pink" },
  green: { ring: "hover:border-stellar-green", iconBg: "bg-stellar-green/15", icon: "text-stellar-green" },
  purple: { ring: "hover:border-stellar-purple", iconBg: "bg-stellar-purple/15", icon: "text-stellar-purple" },
  white: { ring: "hover:border-stellar-white", iconBg: "bg-stellar-white/15", icon: "text-stellar-white" },
  red: { ring: "hover:border-stellar-red", iconBg: "bg-stellar-red/15", icon: "text-stellar-red" },
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

export default async function AdminHubPage() {
  const range30 = resolveDateRange("30", "30");
  const range7 = resolveDateRange("7", "7");
  const ga4Ready = isGa4Configured();
  const gscReady = isSearchConsoleConfigured();
  const odooReady = isOdooConfigured();

  const [salesSummary, topProducts, weekdayPattern, events, webOrders, members, posts, search, traffic, socialStats] = await Promise.all([
    odooReady ? fetchSalesSummary(range30) : Promise.resolve(null),
    odooReady ? fetchTopProducts(range30) : Promise.resolve([]),
    odooReady ? fetchWeekdayPattern(range30) : Promise.resolve([]),
    listAllEvents(),
    listOrders(1000),
    listAllLoyaltyMembers(),
    getPostsFeed(200).catch(() => []),
    gscReady ? fetchSearchSummary(range30) : Promise.resolve(null),
    ga4Ready ? fetchTrafficSummary(range7) : Promise.resolve(null),
    getLatestAccountStats(),
  ]);

  const adsTotals = buildTotals();
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
    searchQueries: search?.topQueries ?? [],
  });
  const topIdea = [...ideas].sort((a, b) => {
    const rank = { fix: 0, watch: 1, win: 2 };
    return rank[a.severity] - rank[b.severity];
  })[0];

  const financeData = {
    posSalesMonth: salesSummary?.monthTotal ?? 0,
    webRevenueMonth: webOrders.filter((o) => isCurrentMonth(o.created_at)).reduce((sum, o) => sum + o.amount_mxn, 0),
    adsSpendTotal: adsTotals.totalSpendMXN,
  };

  // --- Eventos: próximos + boletos vendidos este mes ---
  const upcoming = events.filter((e) => e.status === "upcoming");
  const ticketOrdersThisMonth = webOrders.filter((o) => o.kind === "ticket" && isCurrentMonth(o.created_at));

  // --- Pedidos: pendientes de confirmar correo + total del mes ---
  const needsAttention = webOrders.filter((o) => ["bounced", "failed", "complained"].includes(o.email_customer_status));
  const ordersThisMonth = webOrders.filter((o) => isCurrentMonth(o.created_at));

  // --- Fidelidad: total + nuevos en 30 días ---
  const newMembers30d = members.filter((m) => withinRange(m.created_at, range30));

  // --- Redes: seguidores totales sumados ---
  const totalFollowers = socialStats.reduce((sum, s) => sum + (s.followers ?? 0), 0);

  // --- Tráfico: canal principal ---
  const topChannel = traffic?.channels[0];
  const CHANNEL_LABEL: Record<string, string> = { Direct: "Directo", "Organic Search": "Búsqueda", "Organic Social": "Redes" };

  const summaryData: SectionSummaryData[] = [
    {
      key: "ventas",
      icon: SECTION_ICON.ventas,
      primary: odooReady ? formatMoney(salesSummary?.monthTotal ?? 0) : "—",
      secondary: odooReady ? `ticket prom. ${formatMoney(salesSummary?.avgTicket ?? 0)}` : "Odoo no conectado",
    },
    {
      key: "ideas",
      icon: SECTION_ICON.ideas,
      primary: `${ideas.length} idea${ideas.length !== 1 ? "s" : ""}`,
      secondary: topIdea ? topIdea.title : "Sin suficientes datos todavía",
    },
    {
      key: "redes",
      icon: SECTION_ICON.redes,
      primary: totalFollowers > 0 ? new Intl.NumberFormat("es-MX").format(totalFollowers) : "—",
      secondary: `seguidores en ${socialStats.length} cuenta${socialStats.length !== 1 ? "s" : ""}`,
    },
    {
      key: "trafico",
      icon: SECTION_ICON.trafico,
      primary: traffic ? String(traffic.totalSessions) : "—",
      secondary: topChannel ? `principal: ${CHANNEL_LABEL[topChannel.channel] ?? topChannel.channel}` : "últimos 7 días",
    },
    {
      key: "anuncios",
      icon: SECTION_ICON.anuncios,
      primary: formatMoney(adsTotals.totalSpendMXN),
      secondary: `${adsTotals.campaignCount} campaña${adsTotals.campaignCount !== 1 ? "s" : ""} · histórico`,
    },
    {
      key: "eventos",
      icon: SECTION_ICON.eventos,
      primary: `${upcoming.length} próximo${upcoming.length !== 1 ? "s" : ""}`,
      secondary: `${ticketOrdersThisMonth.length} boletos este mes`,
    },
    {
      key: "pedidos",
      icon: SECTION_ICON.pedidos,
      primary: `${ordersThisMonth.length} este mes`,
      secondary: needsAttention.length > 0 ? `⚠️ ${needsAttention.length} con correo sin confirmar` : "Todo al día",
    },
    {
      key: "fidelidad",
      icon: SECTION_ICON.fidelidad,
      primary: `${members.length} cliente${members.length !== 1 ? "s" : ""}`,
      secondary: `${newMembers30d.length} nuevos en 30 días`,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <StarField />
      </div>

      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="mb-6 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Centro de control · d-stellar
        </p>

        <HomeSectionSummary data={summaryData} />

        <HomeFinanceOverview data={financeData} />

        <div className="grid gap-4 sm:grid-cols-2">
          {SECTION_ORDER.map((key) => {
            const theme = SECTION_THEME[key];
            const Icon = SECTION_ICON[key];
            const style = ACCENT_STYLE[theme.accent];
            return (
              <Link
                key={key}
                href={theme.href}
                className={`group flex items-start gap-4 rounded-lg border-2 border-line bg-stellar-black-soft p-6 transition-all hover:-translate-y-0.5 ${style.ring}`}
              >
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}>
                  <Icon size={22} className={style.icon} />
                </span>
                <div className="min-w-0">
                  <p className="font-demi text-lg font-bold text-stellar-white">{theme.label}</p>
                  <p className="mt-1 text-sm text-stellar-white/60">{SECTION_DESCRIPTION[key]}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
