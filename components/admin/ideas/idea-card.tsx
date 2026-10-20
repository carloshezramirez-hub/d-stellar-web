"use client";

import { useState, useTransition } from "react";
import { updateIdeaStatus } from "@/app/admin/(dashboard)/ideas/actions";
import type { IdeaStatus } from "@/lib/insights/idea-status-db";
import type { Idea } from "@/lib/insights/sales-ideas";

const PRIORITY_LABEL: Record<Idea["severity"], string> = { fix: "Alta", watch: "Media", win: "Baja" };
const PRIORITY_COLOR: Record<Idea["severity"], string> = { fix: "text-stellar-red", watch: "text-stellar-pink", win: "text-stellar-green" };

export function IdeaCard({ idea, initialStatus }: { idea: Idea; initialStatus: IdeaStatus }) {
  const [status, setStatus] = useState<IdeaStatus>(initialStatus);
  const [, startTransition] = useTransition();

  function changeStatus(next: IdeaStatus) {
    setStatus(next);
    startTransition(() => {
      updateIdeaStatus(idea.id, next);
    });
  }

  return (
    <div className={`rounded-lg border p-4 transition-opacity ${status === "done" ? "border-line/40 opacity-50" : "border-line"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${PRIORITY_COLOR[idea.severity]}`}>
          Prioridad {PRIORITY_LABEL[idea.severity]}
        </span>
        <select
          value={status}
          onChange={(e) => changeStatus(e.target.value as IdeaStatus)}
          className="rounded border border-line bg-transparent px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-stellar-white/60"
        >
          <option value="pending">Pendiente</option>
          <option value="in_progress">En curso</option>
          <option value="done">Completada</option>
        </select>
      </div>
      <p className="mb-1 font-demi text-sm font-bold text-stellar-white">{idea.title}</p>
      <p className="text-sm leading-relaxed text-stellar-white/70">{idea.body}</p>
      <p className="mt-2 text-sm font-bold text-stellar-pink">→ {idea.action}</p>
    </div>
  );
}
