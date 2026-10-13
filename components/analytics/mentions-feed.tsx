import type { BrandMention } from "@/lib/mentions/db";

function formatDate(iso: string | null) {
  if (!iso) return "fecha desconocida";
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export function MentionsFeed({ mentions }: { mentions: BrandMention[] }) {
  if (mentions.length === 0) {
    return (
      <div className="rounded border border-line p-6 text-sm text-stellar-white/60">
        Todavía no hay menciones registradas. Esta sección se llena sola en cuanto Google Alerts detecte algo nuevo
        (corre diario).
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {mentions.map((m) => (
        <a
          key={m.id}
          href={m.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-line p-4 transition-colors hover:border-stellar-white/30"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-stellar-white/50">
              {m.domain ?? "fuente desconocida"}
            </span>
            <span className="text-xs text-stellar-white/40">{formatDate(m.publishedAt)}</span>
          </div>
          <p className="mt-2 font-demi text-sm font-bold text-stellar-white">{m.title ?? m.url}</p>
          {m.snippet && <p className="mt-1 line-clamp-2 text-sm text-stellar-white/60">{m.snippet}</p>}
        </a>
      ))}
    </div>
  );
}
