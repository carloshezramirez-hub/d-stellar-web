import Link from "next/link";
import { KpiCards } from "@/components/analytics/kpi-cards";
import { LogoutButton } from "@/components/analytics/logout-button";
import { InteractionsChart, ReachChart } from "@/components/analytics/performance-chart";
import { PostGrid } from "@/components/analytics/post-grid";
import { RetentionFunnel } from "@/components/analytics/retention-funnel";
import { StarField } from "@/components/ui/star-field";
import { isMetaConfigured, isTikTokConfigured } from "@/lib/social/env";
import {
  buildDailySeries,
  buildKpiSummaries,
  DATE_RANGE_OPTIONS,
  DEFAULT_RANGE,
  filterPostsInWindow,
  percentChange,
  pickHighlights,
  resolveRangeDays,
  type KpiSummary,
} from "@/lib/social/kpis";
import { getLatestAccountStats, getPostsFeed, type FeedPost } from "@/lib/social/queries";

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

function formatNumber(n: number | null) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("es-MX").format(n);
}

function timeOfDayGreeting() {
  // Hora de Ciudad de México (misma zona del negocio), no la del servidor.
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/Mexico_City" }).format(
      new Date(),
    ),
  );
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function WelcomeBanner({ allSummary, windowDays }: { allSummary: KpiSummary | undefined; windowDays: number }) {
  const highlight =
    allSummary && allSummary.current.posts > 0
      ? (() => {
          const reachChange = percentChange(allSummary.current.reach, allSummary.previous.reach);
          const trend =
            reachChange === null
              ? ""
              : reachChange >= 0
                ? ` — alcance ▲ ${reachChange.toFixed(0)}% vs. el periodo anterior`
                : ` — alcance ▼ ${Math.abs(reachChange).toFixed(0)}% vs. el periodo anterior`;
          return `Últimos ${windowDays} días: ${formatNumber(allSummary.current.posts)} publicaciones, ${formatNumber(allSummary.current.reach)} de alcance${trend}.`;
        })()
      : "Todavía no hay suficientes publicaciones en este periodo para un resumen.";

  return (
    <div className="mb-6 flex flex-col gap-1 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-demi text-2xl font-bold sm:text-4xl">
          {timeOfDayGreeting()}, equipo de d-stellar 👋
        </p>
        <p className="mt-2 text-sm text-stellar-white/60">{highlight}</p>
      </div>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[10px] font-bold tracking-widest text-stellar-white/40 uppercase">
        🔒 Panel privado · solo equipo
      </span>
    </div>
  );
}

function DateRangeFilter({ current }: { current: string }) {
  return (
    <div className="mb-8 flex gap-2">
      {DATE_RANGE_OPTIONS.map((opt) => (
        <Link
          key={opt.value}
          href={opt.value === DEFAULT_RANGE ? "/analytics" : `/analytics?range=${opt.value}`}
          className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
            opt.value === current
              ? "border-stellar-pink bg-stellar-pink text-stellar-black"
              : "border-line text-stellar-white/60 hover:border-stellar-white/40 hover:scale-105"
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}

function Spotlight({ post }: { post: FeedPost }) {
  const isVideo = post.mediaType === "REELS" || post.avgWatchTimeSeconds !== null || post.platform === "tiktok";

  return (
    <div className="relative mb-10 overflow-hidden rounded-xl border border-stellar-pink/30 bg-gradient-to-br from-stellar-pink/[0.07] via-transparent to-stellar-purple/[0.07] p-6 sm:p-8">
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full opacity-20 blur-3xl motion-safe:animate-drift"
        style={{ background: "radial-gradient(circle, var(--color-stellar-pink), transparent 70%)" }}
        aria-hidden="true"
      />
      <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-widest text-stellar-green uppercase">
        🔥 Destacado del periodo
      </p>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
        {post.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnailUrl} alt="" className="aspect-square w-full rounded-lg object-cover lg:w-[220px]" />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-line bg-stellar-black-soft lg:w-[220px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logos/dstellar-wordmark-white.png" alt="d-stellar" className="w-2/3 opacity-50" />
          </div>
        )}
        <div className="min-w-0">
          <span className="mb-2 inline-block rounded border border-line px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stellar-white/60">
            {PLATFORM_LABEL[post.platform] ?? post.platform} · @{post.handle}
          </span>
          {post.caption && <p className="mb-4 line-clamp-4 text-sm text-stellar-white/80">{post.caption}</p>}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="font-demi text-2xl font-bold">{formatNumber(isVideo ? post.views : post.reach)}</p>
              <p className="text-xs text-stellar-white/50">{isVideo ? "reproducciones" : "alcance"}</p>
            </div>
            <div>
              <p className="font-demi text-2xl font-bold">{formatNumber(post.likes)}</p>
              <p className="text-xs text-stellar-white/50">me gusta</p>
            </div>
            <div>
              <p className="font-demi text-2xl font-bold">{formatNumber(post.shares)}</p>
              <p className="text-xs text-stellar-white/50">compartidos</p>
            </div>
          </div>
        </div>
        <div className="border-t border-line pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Retención</p>
          <RetentionFunnel post={post} />
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AnalyticsDashboardPage({ searchParams }: PageProps) {
  const { range: rawRange } = await searchParams;
  const range = DATE_RANGE_OPTIONS.some((o) => o.value === rawRange) ? rawRange! : DEFAULT_RANGE;

  const hasMeta = isMetaConfigured();
  const hasTikTok = isTikTokConfigured();
  const [stats, allPosts] = await Promise.all([getLatestAccountStats(), getPostsFeed()]);

  const windowDays = resolveRangeDays(range, allPosts);
  const posts = filterPostsInWindow(allPosts, windowDays);

  const kpiSummaries = buildKpiSummaries(allPosts, windowDays);
  const dailySeries = buildDailySeries(allPosts, windowDays);
  const { topId, lowId } = pickHighlights(posts);
  const spotlightPost = posts.find((p) => p.id === topId) ?? null;

  return (
    <main className="relative mx-auto max-w-6xl overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <StarField />
      </div>

      <header className="mb-2 flex items-center justify-between">
        <h1 className="font-demi text-2xl font-bold sm:text-3xl">d-stellar · Analítica social</h1>
        <LogoutButton />
      </header>

      <WelcomeBanner allSummary={kpiSummaries.find((s) => s.platform === "all")} windowDays={windowDays} />

      {spotlightPost && <Spotlight post={spotlightPost} />}

      {stats.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={`${s.platform}-${s.handle}`}
              className="rounded-lg border border-line p-6 transition-colors hover:border-stellar-white/30"
            >
              <p className="text-xs uppercase tracking-widest text-stellar-white/50">
                {PLATFORM_LABEL[s.platform] ?? s.platform} · @{s.handle}
              </p>
              <p className="mt-4 font-demi text-3xl font-bold">{formatNumber(s.followers)}</p>
              <p className="text-sm text-stellar-white/60">seguidores</p>
              {s.totalLikes !== null && (
                <p className="mt-3 text-sm text-stellar-white/70">
                  {formatNumber(s.totalLikes)} likes totales · {formatNumber(s.videoCount)} posts
                </p>
              )}
              <p className="mt-4 text-xs text-stellar-white/40">
                Actualizado: {new Date(s.capturedAt).toLocaleString("es-MX")}
              </p>
            </div>
          ))}
        </div>
      )}

      <DateRangeFilter current={range} />

      {posts.length === 0 && allPosts.length === 0 ? (
        <div className="grid gap-4 rounded border border-line p-6 text-stellar-white/70">
          <p>
            Todavía no hay publicaciones que mostrar. Esta pantalla se llena automáticamente en cuanto el cron de
            métricas corra.
          </p>
          <ul className="grid gap-1 text-sm">
            <li>Instagram + Facebook: {hasMeta ? "conectado ✓" : "pendiente de credenciales"}</li>
            <li>TikTok: {hasTikTok ? "conectado ✓" : "pendiente del @handle"}</li>
          </ul>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {kpiSummaries.map((summary) => (
              <KpiCards key={summary.platform} summary={summary} windowDays={windowDays} />
            ))}
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <InteractionsChart data={dailySeries} />
            <ReachChart data={dailySeries} />
          </div>

          {posts.length === 0 ? (
            <p className="rounded border border-line p-6 text-sm text-stellar-white/60">
              No hay publicaciones dentro de este rango de fechas.
            </p>
          ) : (
            <PostGrid posts={posts} topId={topId} lowId={lowId} />
          )}
        </>
      )}
    </main>
  );
}
