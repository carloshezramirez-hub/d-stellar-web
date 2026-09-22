import type { EventLeadSegment } from "@/lib/event-leads-db";

/**
 * Categorías objetivo para la prospección del espacio de eventos,
 * mapeadas a los 4 segmentos que Carlos definió. Lista editable — ajustar
 * aquí no requiere tocar ninguna otra parte del sistema.
 */
export const TARGET_CATEGORIES: { category: string; segment: EventLeadSegment }[] = [
  { category: "agencia de marketing", segment: "marca" },
  { category: "agencia de publicidad", segment: "marca" },
  { category: "estudio de diseño", segment: "marca" },
  { category: "coworking", segment: "corporativo" },
  { category: "oficinas corporativas", segment: "corporativo" },
  { category: "organización sin fines de lucro", segment: "comunidad" },
  { category: "centro comunitario", segment: "comunidad" },
  { category: "organizador de eventos", segment: "particulares" },
  { category: "wedding planner", segment: "particulares" },
];
