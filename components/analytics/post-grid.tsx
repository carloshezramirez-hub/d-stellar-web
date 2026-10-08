"use client";

import { forwardRef, useState, type ButtonHTMLAttributes } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { generatePostInsights } from "@/lib/social/kpis";
import type { FeedPost } from "@/lib/social/queries";
import { RetentionFunnel } from "./retention-funnel";

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

const PLATFORM_GLOW_CLASS: Record<string, string> = {
  instagram: "hover:shadow-[0_0_28px_rgba(255,112,224,0.18)] hover:border-stellar-pink/50",
  facebook: "hover:shadow-[0_0_28px_rgba(36,58,210,0.22)] hover:border-stellar-blue/50",
  tiktok: "hover:shadow-[0_0_28px_rgba(255,255,255,0.14)] hover:border-stellar-white/40",
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

function Metric({ label, value }: { label: string; value: string | null }) {
  if (value === null) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-stellar-white/40">{label}</p>
      <p className="font-demi text-sm font-bold">{value}</p>
    </div>
  );
}

function PostDetail({ post, peers }: { post: FeedPost; peers: FeedPost[] }) {
  const isVideo = post.mediaType === "REELS" || post.avgWatchTimeSeconds !== null || post.platform === "tiktok";
  const insights = generatePostInsights(post, peers);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${PLATFORM_BADGE_CLASS[post.platform] ?? "border-line text-stellar-white/60"}`}
        >
          {PLATFORM_LABEL[post.platform] ?? post.platform}
        </span>
        <span className="text-xs text-stellar-white/40">@{post.handle}</span>
      </div>

      {post.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.thumbnailUrl} alt="" className="mb-4 max-h-80 w-full rounded-lg object-cover" />
      )}

      {post.caption && <p className="mb-5 text-sm whitespace-pre-line text-stellar-white/80">{post.caption}</p>}

      <div className="mb-6 grid grid-cols-3 gap-4 border-y border-line py-4 sm:grid-cols-4">
        <Metric label={isVideo ? "Reproducciones" : "Alcance"} value={formatNumber(isVideo ? post.views : post.reach)} />
        {isVideo && <Metric label="Alcance" value={formatNumber(post.reach)} />}
        <Metric label="Me gusta" value={formatNumber(post.likes)} />
        <Metric label="Comentarios" value={formatNumber(post.comments)} />
        <Metric label="Compartidos" value={formatNumber(post.shares)} />
        <Metric label="Guardados" value={formatNumber(post.saves)} />
        <Metric label="Tiempo de reproducción" value={formatSeconds(post.avgWatchTimeSeconds)} />
        <Metric label="% video completo" value={post.completionRate !== null ? `${(post.completionRate * 100).toFixed(0)}%` : null} />
      </div>

      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Retención</p>
      <div className="mb-6">
        <RetentionFunnel post={post} />
      </div>

      {insights.length > 0 && (
        <div className="mb-6 grid gap-1.5">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Lecturas automáticas</p>
          {insights.map((insight) => (
            <p key={insight.text} className={`text-sm ${insight.kind === "good" ? "text-stellar-green" : "text-stellar-red"}`}>
              {insight.kind === "good" ? "✅" : "⚠️"} {insight.text}
            </p>
          ))}
        </div>
      )}

      {post.permalink && (
        <a
          href={post.permalink}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs font-bold text-stellar-pink underline underline-offset-4"
        >
          Ver publicación original →
        </a>
      )}
    </div>
  );
}

interface PostTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  post: FeedPost;
  isTop: boolean;
  isLow: boolean;
}

const PostTile = forwardRef<HTMLButtonElement, PostTileProps>(function PostTile(
  { post, isTop, isLow, className, ...rest },
  ref,
) {
  const isVideo = post.mediaType === "REELS" || post.avgWatchTimeSeconds !== null || post.platform === "tiktok";
  const primaryStat = isVideo ? post.views : post.reach;

  return (
    <button
      ref={ref}
      type="button"
      className={`group relative aspect-square w-full overflow-hidden rounded-lg border border-line text-left transition-all duration-300 ${PLATFORM_GLOW_CLASS[post.platform] ?? ""} ${className ?? ""}`}
      {...rest}
    >
      {post.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.thumbnailUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-stellar-black-soft text-[10px] uppercase text-stellar-white/30">
          Sin imagen
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
        <span
          className={`rounded border bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm ${PLATFORM_BADGE_CLASS[post.platform] ?? "border-line text-stellar-white/60"}`}
        >
          {PLATFORM_LABEL[post.platform] ?? post.platform}
        </span>
        {isTop && (
          <span className="rounded border border-stellar-green bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-stellar-green backdrop-blur-sm">
            🔥 top
          </span>
        )}
        {isLow && (
          <span className="rounded border border-stellar-red bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-stellar-red backdrop-blur-sm">
            ⚠️
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-demi text-xl font-bold text-white drop-shadow-sm">{formatNumber(primaryStat)}</p>
        <p className="text-[10px] uppercase tracking-widest text-white/60">{isVideo ? "reproducciones" : "alcance"}</p>
      </div>
    </button>
  );
});

export function PostGrid({
  posts,
  topId,
  lowId,
}: {
  posts: FeedPost[];
  topId: string | null;
  lowId: string | null;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const dayGroups = groupPostsByDay(posts);
  const openPost = posts.find((p) => p.id === openId) ?? null;

  return (
    <Dialog open={openId !== null} onOpenChange={(open) => !open && setOpenId(null)}>
      <div className="grid gap-10">
        {dayGroups.map(([dayKey, dayPosts], groupIndex) => (
          <section key={dayKey} style={{ animationDelay: `${groupIndex * 40}ms` }} className="motion-safe:animate-[riseIn_0.5s_ease-out_backwards]">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-stellar-white/50">{formatDayHeading(dayKey)}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {dayPosts.map((post) => (
                <DialogTrigger key={post.id} asChild onClick={() => setOpenId(post.id)}>
                  <PostTile post={post} isTop={post.id === topId} isLow={post.id === lowId} />
                </DialogTrigger>
              ))}
            </div>
          </section>
        ))}
      </div>

      <DialogContent>
        <DialogTitle className="sr-only">Detalle de publicación</DialogTitle>
        {openPost && <PostDetail post={openPost} peers={posts} />}
      </DialogContent>
    </Dialog>
  );
}
