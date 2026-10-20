export type SectionKey = "ventas" | "ideas" | "redes" | "trafico" | "anuncios" | "eventos" | "pedidos" | "fidelidad";

export type SectionAccent = "pink" | "green" | "blue" | "red" | "purple" | "white";

export interface SectionThemeEntry {
  label: string;
  href: string;
  accent: SectionAccent;
}

/**
 * Una sola fuente de verdad para el color de cada sección — usada en
 * ConsoleShell (pills), el hub (/admin) y el borde de KpiTile de cada
 * dashboard, para que el mismo color identifique siempre a la misma área.
 *
 * Solo 6 colores de marca existen (ver app/globals.css: "no sustituir con
 * colores parecidos", son los del manual oficial) para 8 secciones — dos
 * pares se repiten a propósito (Ventas/Eventos en verde, Ideas/Fidelidad en
 * rosa), elegidos porque nunca se confunden entre sí (íconos y posición en
 * el nav distintos) en vez de inventar colores nuevos fuera de marca.
 */
export const SECTION_THEME: Record<SectionKey, SectionThemeEntry> = {
  ventas: { label: "Ventas", href: "/admin/ventas", accent: "green" },
  ideas: { label: "Ideas", href: "/admin/ideas", accent: "pink" },
  redes: { label: "Redes sociales", href: "/analytics", accent: "purple" },
  trafico: { label: "Tráfico", href: "/admin/trafico", accent: "blue" },
  anuncios: { label: "Anuncios", href: "/admin/anuncios", accent: "red" },
  eventos: { label: "Eventos", href: "/admin/eventos", accent: "green" },
  pedidos: { label: "Pedidos", href: "/pedidos", accent: "white" },
  fidelidad: { label: "Fidelidad", href: "/wallet-staff", accent: "pink" },
};

export const SECTION_ORDER: SectionKey[] = ["ventas", "ideas", "redes", "trafico", "anuncios", "eventos", "pedidos", "fidelidad"];
