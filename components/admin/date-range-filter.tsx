import Link from "next/link";
import { DATE_RANGE_OPTIONS } from "@/lib/admin/date-range";

/** Mismos pills que ya usaba /analytics — reusados en todos los dashboards que aceptan ?range=. */
export function DateRangeFilter({ basePath, current }: { basePath: string; current: string }) {
  return (
    <div className="mb-6 flex gap-2">
      {DATE_RANGE_OPTIONS.map((opt) => (
        <Link
          key={opt.value}
          href={`${basePath}?range=${opt.value}`}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
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
