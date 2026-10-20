"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DATE_RANGE_PRESETS } from "@/lib/admin/date-range";
import type { SectionAccent } from "@/lib/admin/section-theme";

const ACCENT_HEX: Record<SectionAccent, string> = {
  pink: "var(--color-stellar-pink)",
  green: "var(--color-stellar-green)",
  blue: "var(--color-stellar-blue)",
  red: "var(--color-stellar-red)",
  purple: "var(--color-stellar-purple)",
  white: "var(--color-stellar-white)",
};

interface DateRangeFilterProps {
  basePath: string;
  current: string;
  accent?: SectionAccent;
  from?: string;
  to?: string;
}

/** Selector de rango compartido por todos los dashboards — pills + "Personalizado" con 2 fechas. */
export function DateRangeFilter({ basePath, current, accent = "pink", from, to }: DateRangeFilterProps) {
  const router = useRouter();
  const [showCustom, setShowCustom] = useState(current === "custom");
  const [fromVal, setFromVal] = useState(from ?? "");
  const [toVal, setToVal] = useState(to ?? "");
  const color = ACCENT_HEX[accent];

  function applyCustom() {
    if (!fromVal || !toVal) return;
    router.push(`${basePath}?range=custom&from=${fromVal}&to=${toVal}`);
  }

  const pillClass =
    "rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all border-line text-stellar-white/60 hover:border-stellar-white/40";

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {DATE_RANGE_PRESETS.map((opt) => {
          const active = opt.value === current;
          if (opt.value === "custom") {
            return (
              <button
                key="custom"
                type="button"
                onClick={() => setShowCustom((v) => !v)}
                className={pillClass}
                style={active ? { borderColor: color, background: color, color: "#000" } : undefined}
              >
                {opt.label}
              </button>
            );
          }
          return (
            <Link
              key={opt.value}
              href={`${basePath}?range=${opt.value}`}
              className={pillClass}
              style={active ? { borderColor: color, background: color, color: "#000" } : undefined}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {showCustom && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <input
            type="date"
            value={fromVal}
            onChange={(e) => setFromVal(e.target.value)}
            className="rounded border border-line bg-stellar-black-soft px-2 py-1.5 text-stellar-white"
          />
          <span className="text-stellar-white/40">a</span>
          <input
            type="date"
            value={toVal}
            onChange={(e) => setToVal(e.target.value)}
            className="rounded border border-line bg-stellar-black-soft px-2 py-1.5 text-stellar-white"
          />
          <button
            type="button"
            onClick={applyCustom}
            disabled={!fromVal || !toVal}
            className="rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-stellar-black disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: color }}
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
