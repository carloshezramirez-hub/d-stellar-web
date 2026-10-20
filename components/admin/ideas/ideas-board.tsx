"use client";

import { useMemo, useState } from "react";
import { IdeaCard } from "@/components/admin/ideas/idea-card";
import { SECTION_THEME, type SectionKey } from "@/lib/admin/section-theme";
import type { IdeaStatus } from "@/lib/insights/idea-status-db";
import type { Idea } from "@/lib/insights/sales-ideas";

const VISIBLE_PER_GROUP = 3;

function IdeaGroup({ sourceKey, ideas, statuses }: { sourceKey: SectionKey; ideas: Idea[]; statuses: Record<string, IdeaStatus> }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ideas : ideas.slice(0, VISIBLE_PER_GROUP);
  const theme = SECTION_THEME[sourceKey];

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="size-2 rounded-full" style={{ background: `var(--color-stellar-${theme.accent})` }} />
        <h2 className="font-demi text-base font-bold text-stellar-white">{theme.label}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} initialStatus={statuses[idea.id] ?? "pending"} />
        ))}
      </div>
      {ideas.length > VISIBLE_PER_GROUP && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs font-bold uppercase tracking-widest text-stellar-white/40 underline underline-offset-4 hover:text-stellar-white/70"
        >
          {showAll ? "Ver menos" : `Ver ${ideas.length - VISIBLE_PER_GROUP} más`}
        </button>
      )}
    </section>
  );
}

export function IdeasBoard({ ideas, statuses }: { ideas: Idea[]; statuses: Record<string, IdeaStatus> }) {
  const grouped = useMemo(() => {
    const map = new Map<SectionKey, Idea[]>();
    for (const idea of ideas) {
      const key = idea.source as SectionKey;
      map.set(key, [...(map.get(key) ?? []), idea]);
    }
    return map;
  }, [ideas]);

  if (ideas.length === 0) {
    return (
      <p className="rounded border border-line p-6 text-sm text-stellar-white/60">
        Todavía no hay suficientes datos conectados para generar ideas confiables.
      </p>
    );
  }

  return (
    <div className="grid gap-8">
      {[...grouped.entries()].map(([sourceKey, groupIdeas]) => (
        <IdeaGroup key={sourceKey} sourceKey={sourceKey} ideas={groupIdeas} statuses={statuses} />
      ))}
    </div>
  );
}
