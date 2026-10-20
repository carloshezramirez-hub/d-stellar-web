import type { ConversionEvent } from "@/lib/google/analytics";

const EVENT_LABEL: Record<string, string> = {
  begin_checkout_ticket: "Empezó a comprar boleto",
  submit_ticket_order: "Completó compra de boleto",
  begin_checkout_pickup: "Empezó pedido de pickup",
  submit_pickup_order: "Completó pedido de pickup",
  submit_loyalty_signup: "Se registró en Fidelidad",
  click_whatsapp: "Clic en WhatsApp",
  click_phone: "Clic en teléfono",
  click_directions: "Clic en cómo llegar",
  click_event: "Clic en un evento",
  click_menu: "Clic en el menú",
  click_instagram: "Clic en Instagram",
  click_tiktok: "Clic en TikTok",
};

/** Acciones reales con intención (no page_view/scroll genéricos) — para ver dónde se cae la gente en el camino a comprar. */
export function ConversionsTable({ events }: { events: ConversionEvent[] }) {
  if (events.length === 0) return null;
  const sorted = [...events].sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-stellar-white/50">Acciones reales en el sitio</p>
      <p className="mb-4 text-[11px] text-stellar-white/35">Eventos con intención de compra/contacto, no vistas de página genéricas</p>
      <div className="grid gap-2">
        {sorted.map((e) => (
          <div key={e.name} className="flex items-center justify-between gap-3 border-b border-line/30 pb-2 text-sm">
            <span className="text-stellar-white/80">{EVENT_LABEL[e.name] ?? e.name}</span>
            <span className="font-bold text-stellar-white">{e.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
