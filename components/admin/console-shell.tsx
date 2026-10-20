"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SECTION_ORDER, SECTION_THEME, type SectionAccent } from "@/lib/admin/section-theme";

const ACCENT_HEX: Record<SectionAccent, string> = {
  pink: "var(--color-stellar-pink)",
  green: "var(--color-stellar-green)",
  blue: "var(--color-stellar-blue)",
  red: "var(--color-stellar-red)",
  purple: "var(--color-stellar-purple)",
  white: "var(--color-stellar-white)",
};

/**
 * Barra superior fija, compartida por /admin y todo lo que cuelga de ahí —
 * reemplaza los headers ad hoc + botones "Salir"/"Volver al panel"
 * duplicados que tenía cada sección. Al estar siempre visible, cualquier
 * sección es un clic desde cualquier otra (navegación libre pedida por
 * Carlos), no solo "volver". Cada pill usa el color fijo de su sección
 * (ver lib/admin/section-theme.ts) — texto negro sobre fondo de color
 * cuando está activa, que es el patrón aprobado por el manual de marca
 * para esos tonos saturados (ver nota en app/globals.css).
 */
export function ConsoleShell() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-stellar-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/admin" className="flex shrink-0 items-center gap-1.5">
          <span className="font-demi text-sm font-bold tracking-widest text-stellar-white">D-STELLAR</span>
          <span className="text-stellar-pink">✺</span>
        </Link>

        <nav className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {SECTION_ORDER.map((key) => {
            const s = SECTION_THEME[key];
            const active = pathname === s.href || pathname.startsWith(`${s.href}/`);
            return (
              <Link
                key={key}
                href={s.href}
                className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-tag text-[11px] font-bold tracking-widest uppercase transition-colors text-stellar-white/55 hover:text-stellar-white"
                style={active ? { background: ACCENT_HEX[s.accent], color: "#000" } : undefined}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <span className="hidden items-center gap-1.5 text-[10px] font-bold tracking-widest text-stellar-white/40 uppercase sm:flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-stellar-green opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-stellar-green" />
            </span>
            En vivo
          </span>
          <button
            type="button"
            onClick={logout}
            className="font-tag text-[11px] font-bold tracking-widest text-stellar-white/55 uppercase hover:text-stellar-white"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
