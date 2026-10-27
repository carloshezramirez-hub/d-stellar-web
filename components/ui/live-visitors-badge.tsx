"use client";

import { useEffect, useState } from "react";

/**
 * Badge "gente conectada ahora" — dato real de GA4 Realtime (no inventado),
 * con un planeta animado. Solo para /admin (texto fijo en español, sin
 * next-intl porque /admin vive fuera de [locale] y no tiene ese provider).
 * Se oculta solo si GA4 no está configurado o devuelve null — un 0 real sí
 * se muestra, es información útil para Carlos aunque no sea bonita.
 */
export function LiveVisitorsBadge() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/analytics/active-users");
        const data = (await res.json()) as { activeUsers: number | null };
        if (!cancelled) setActiveUsers(data.activeUsers);
      } catch {
        if (!cancelled) setActiveUsers(null);
      }
    }

    void poll();
    const interval = setInterval(poll, 20_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (activeUsers === null) return null;

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-line bg-stellar-black-soft px-4 py-2.5">
      <div className="relative h-6 w-6 shrink-0">
        <div
          className="absolute inset-0 animate-spin rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, var(--color-stellar-purple), var(--color-stellar-pink), var(--color-stellar-blue), var(--color-stellar-purple))",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute inset-[-3px] rounded-full border border-stellar-pink/50"
          style={{ transform: "rotate(-20deg) scaleY(0.4)" }}
        />
      </div>
      <p className="font-tag text-xs uppercase tracking-widest text-stellar-white/80">
        <span className="font-bold text-stellar-white">{activeUsers}</span>{" "}
        {activeUsers === 1 ? "persona conectada ahora" : "personas conectadas ahora"}
      </p>
    </div>
  );
}
