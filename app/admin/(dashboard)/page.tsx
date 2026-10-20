import Link from "next/link";
import { Sparkles, BarChart3, Megaphone, CalendarDays, ShoppingBag, Store } from "lucide-react";
import { ConsoleShell } from "@/components/admin/console-shell";
import { StarField } from "@/components/ui/star-field";

const SECTIONS = [
  {
    href: "/admin/ventas",
    title: "Ventas",
    description: "Ventas reales de piso (Punto de Venta), directo de Odoo.",
    icon: Store,
    accent: "green" as const,
  },
  {
    href: "/analytics",
    title: "Analytics",
    description: "Crecimiento orgánico en Instagram, Facebook y TikTok — qué posts funcionan.",
    icon: BarChart3,
    accent: "blue" as const,
  },
  {
    href: "/admin/anuncios",
    title: "Anuncios",
    description: "Campañas pagadas de TikTok Ads — qué funcionó, qué corregir.",
    icon: Megaphone,
    accent: "pink" as const,
  },
  {
    href: "/admin/eventos",
    title: "Eventos",
    description: "Crear/editar eventos, marcar sesiones agotadas, ver quién ya pagó.",
    icon: CalendarDays,
    accent: "purple" as const,
  },
  {
    href: "/pedidos",
    title: "Pedidos",
    description: "Historial de compras — boletos y pickup, con estado de entrega.",
    icon: ShoppingBag,
    accent: "pink" as const,
  },
  {
    href: "/wallet-staff",
    title: "Fidelidad",
    description: "Escanear tarjetas, sumar sellos y ver la base de clientes.",
    icon: Sparkles,
    accent: "purple" as const,
  },
];

const ACCENT_STYLE: Record<string, { ring: string; iconBg: string; icon: string }> = {
  blue: { ring: "hover:border-stellar-blue", iconBg: "bg-stellar-blue/15", icon: "text-stellar-blue" },
  pink: { ring: "hover:border-stellar-pink", iconBg: "bg-stellar-pink/15", icon: "text-stellar-pink" },
  green: { ring: "hover:border-stellar-green", iconBg: "bg-stellar-green/15", icon: "text-stellar-green" },
  purple: { ring: "hover:border-stellar-purple", iconBg: "bg-stellar-purple/15", icon: "text-stellar-purple" },
};

export default function AdminHubPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <StarField />
      </div>

      <ConsoleShell />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="mb-8 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Centro de control · d-stellar
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map(({ href, title, description, icon: Icon, accent }) => {
            const style = ACCENT_STYLE[accent];
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-start gap-4 rounded-lg border-2 border-line bg-stellar-black-soft p-6 transition-all hover:-translate-y-0.5 ${style.ring}`}
              >
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}>
                  <Icon size={22} className={style.icon} />
                </span>
                <div className="min-w-0">
                  <p className="font-demi text-lg font-bold text-stellar-white">{title}</p>
                  <p className="mt-1 text-sm text-stellar-white/60">{description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
