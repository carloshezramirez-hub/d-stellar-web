import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { SECTION_THEME, type SectionKey } from "@/lib/admin/section-theme";

const ACCENT_HEX: Record<string, string> = {
  pink: "var(--color-stellar-pink)",
  green: "var(--color-stellar-green)",
  blue: "var(--color-stellar-blue)",
  red: "var(--color-stellar-red)",
  purple: "var(--color-stellar-purple)",
  white: "var(--color-stellar-white)",
};

export interface SectionSummaryData {
  key: SectionKey;
  icon: LucideIcon;
  primary: string;
  secondary: string;
}

/** Mini-tile de resumen por área en el home — 2 datos, su color de sección, y un link directo. Nada más (el detalle vive en la sección misma). */
export function HomeSectionSummary({ data }: { data: SectionSummaryData[] }) {
  return (
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {data.map(({ key, icon: Icon, primary, secondary }) => {
        const theme = SECTION_THEME[key];
        const color = ACCENT_HEX[theme.accent];
        return (
          <Link
            key={key}
            href={theme.href}
            className="group rounded-lg border border-line bg-stellar-black-soft p-4 transition-colors hover:border-white/30"
            style={{ borderTopColor: color, borderTopWidth: 2 }}
          >
            <div className="mb-2 flex items-center gap-1.5">
              <Icon size={14} style={{ color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stellar-white/50">{theme.label}</span>
            </div>
            <p className="font-demi text-lg font-bold text-stellar-white">{primary}</p>
            <p className="truncate text-xs text-stellar-white/50">{secondary}</p>
          </Link>
        );
      })}
    </div>
  );
}
