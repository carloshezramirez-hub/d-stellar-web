import Link from "next/link";
import { KpiCards } from "@/components/analytics/kpi-cards";
import { LogoutButton } from "@/components/analytics/logout-button";
import { InteractionsChart, ReachChart } from "@/components/analytics/performance-chart";
import { isMetaConfigured, isTikTokConfigured } from "@/lib/social/env";
import {
  buildDailySeries,
  buildKpiSummaries,
  DATE_RANGE_OPTIONS,
  DEFAULT_RANGE,
  filterPostsInWindow,
  generatePostInsights,
  pickHighlights,
  resolveRangeDays,
} from "@/lib/social/kpis";
import { getLatestAccountStats, getPostsFeed, type FeedPost } from "@/lib/social/queries";

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

const PLATFORM_BADGE_CLASS: Record<string, string> = {
  instagram: "border-stellar-pink text-stellar-pink",
  facebook: "border-stellar-blue text-stellar-blue",
  tiktok: "border-stellar-white text-stellar-white",
};

function formatNumber(n: number | null) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("es-MX").format(n);
}

function formatSeconds(s: number | null) {
  if (s === null || s === undefined) return null;
  const total = Math.round(s);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function formatDayHeading(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  const label = date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function groupPostsByDay(posts: FeedPost[]): [string, FeedPost[]][] {
  const groups = new Map<string, FeedPost[]>();
  for (const post of posts) {
    if (!post.postedAt) continue;
    const dayKey = post.postedAt.slice(0, 10);
    if (!groups.has(dayKey)) groups.set(dayKey, []);
    groups.get(dayKey)!.push(post);
  }
  return Array.from(groups.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

function DateRangeFilter({ current }: { current: string }) {
  return (
    <div className="mb-8 flex gap-2">
      {DATE_RANGE_OPTIONS.map((opt) => (
        <Link
          key={opt.value}
          href={opt.value === DEFAULT_RANGE ? "/analytics" : `/analytics?range=${opt.value}`}
          className={`rounded border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
            opt.value === current
              ? "border-stellar-pink bg-stellar-pink text-stellar-black"
              : "border-line text-stellar-white/60 hover:border-stellar-white/40"
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}

function PostMetric({ label, value }: { label: string; value: string | null }) {
  if (value === null) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-stellar-white/40">{label}</p>
      <p className="font-demi text-sm font-bold">{value}</p>
    </div>
  );
}

function PostCard({
  post,
  peers,
  isTop,
  isLow,
}: {
  post: FeedPost;
  peers: FeedPost[];
  isTop: boolean;
  isLow: boolean;
}) {
  const isVideo = post.mediaType === "REELS" || post.avgWatchTimeSeconds !== null || post.platform === "tiktok";
  const insights = generatePostInsights(post, peers);

  return (
    <a
      href={post.permalink ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="flex gap-4 rounded border border-line p-4 transition-colors hover:border-stellar-white/40"
    >
      {post.thumbnailUrl ? (
        // Miniaturas de Instagram/Facebook son URLs firmadas y cambian en cada fetch — no vale la pena pasarlas por next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.thumbnailUrl} alt="" className="h-20 w-20 shrink-0 rounded object-cover" loading="lazy" />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded border border-line text-[10px] uppercase text-stellar-white/30">
          Sin imagen
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${PLATFORM_BADGE_CLASS[post.platform] ?? "border-line text-stellar-white/60"}`}
          >
            {PLATFORM_LABEL[post.platform] ?? post.platform}
          </span>
          <span className="text-[10px] text-stellar-white/40">@{post.handle}</span>
          {isTop && (
            <span className="rounded border border-stellar-green px-2 py-0.5 text-[10px] font-bold text-stellar-green">
              🔥 mejor de este periodo
            </span>
          )}
          {isLow && (
            <span className="rounded border border-stellar-red px-2 py-0.5 text-[10px] font-bold text-stellar-red">
              ⚠️ necesita ajustes
            </span>
          )}
        </div>

        {post.caption && <p className="mb-3 line-clamp-2 text-sm text-stellar-white/80">{post.caption}</p>}

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <PostMetric label={isVideo ? "Reproducciones" : "Alcance"} value={formatNumber(isVideo ? post.views : post.reach)} />
          {isVideo && <PostMetric label="Alcance" value={formatNumber(post.reach)} />}
          <PostMetric label="Me gusta" value={formatNumber(post.likes)} />
          <PostMetric label="Comentarios" value={formatNumber(post.comments)} />
          <PostMetric label="Compartidos" value={formatNumber(post.shares)} />
          <PostMetric label="Guardados" value={formatNumber(post.saves)} />
          <PostMetric label="Tiempo de reproducción" value={formatSeconds(post.avgWatchTimeSeconds)} />
        </div>

        {insights.length > 0 && (
          <div className="mt-3 grid gap-1 border-t border-line pt-3">
            {insights.map((insight) => (
              <p
                key={insight.text}
                className={`text-xs ${insight.kind === "good" ? "text-stellar-green" : "text-stellar-red"}`}
              >
                {insight.kind === "good" ? "✅" : "⚠️"} {insight.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </a>
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

  const dayGroups = groupPostsByDay(posts);
  const kpiSummaries = buildKpiSummaries(allPosts, windowDays);
  const dailySeries = buildDailySeries(allPosts, windowDays);
  const { topId, lowId } = pickHighlights(posts);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between border-b border-line pb-6">
        <h1 className="font-bold text-2xl">d-stellar · Analítica social</h1>
        <LogoutButton />
      </header>

      {stats.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={`${s.platform}-${s.handle}`} className="rounded border border-line p-6">
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
            <li>TikTok: {hasTikTok ? "conectado ✓ (solo cuenta, aún sin video por video)" : "pendiente del @handle"}</li>
          </ul>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4">
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
            <div className="grid gap-8">
              {dayGroups.map(([dayKey, dayPosts]) => (
                <section key={dayKey}>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-stellar-white/50">
                    {formatDayHeading(dayKey)}
                  </h2>
                  <div className="grid gap-3">
                    {dayPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        peers={posts}
                        isTop={post.id === topId}
                        isLow={post.id === lowId}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
