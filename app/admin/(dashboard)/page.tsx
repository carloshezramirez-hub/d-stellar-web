"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, BarChart3, Megaphone, CalendarDays, ShoppingBag } from "lucide-react";

const SECTIONS = [
  {
    href: "/wallet-staff",
    title: "Fidelidad",
    description: "Escanear tarjetas, sumar sellos y ver la base de clientes.",
    icon: Sparkles,
  },
  {
    href: "/analytics",
    title: "Analytics",
    description: "Redes sociales — Instagram, Facebook, TikTok.",
    icon: BarChart3,
  },
  {
    href: "/admin/anuncios",
    title: "Anuncios",
    description: "Campañas pagadas de TikTok — qué funcionó, qué corregir.",
    icon: Megaphone,
  },
  {
    href: "/admin/eventos",
    title: "Eventos",
    description: "Crear/editar eventos, marcar sesiones agotadas, ver quién ya pagó.",
    icon: CalendarDays,
  },
  {
    href: "/pedidos",
    title: "Pedidos",
    description: "Historial de compras — boletos y pickup.",
    icon: ShoppingBag,
  },
];

export default function AdminHubPage() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <h1 className="font-demi text-sm font-bold uppercase tracking-widest text-stellar-white">d-stellar · Panel</h1>
        <button type="button" onClick={logout} className="text-xs text-stellar-white/60 underline underline-offset-4">
          Salir
        </button>
      </header>

      <div className="mx-auto grid max-w-4xl gap-5 p-6 sm:grid-cols-2">
        {SECTIONS.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 border-2 border-line bg-stellar-black-soft p-6 transition-colors hover:border-stellar-pink"
          >
            <Icon size={28} className="text-stellar-pink" />
            <div>
              <p className="font-demi text-xl font-bold text-stellar-white group-hover:text-stellar-pink">{title}</p>
              <p className="mt-1 text-sm text-stellar-white/60">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
