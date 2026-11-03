import Link from "next/link";
import { BookOpen, Newspaper, Star, Store, BookMarked } from "lucide-react";
import { ConsoleShell } from "@/components/admin/console-shell";

const CARDS = [
  {
    href: "/admin/contenido/menu",
    icon: BookOpen,
    title: "Menú",
    body: "Secciones y productos del menú, precios, tags y la etiqueta del mes.",
  },
  {
    href: "/admin/contenido/prensa",
    icon: Newspaper,
    title: "Prensa",
    body: "Notas y reportajes reales que han hablado de d-stellar.",
  },
  {
    href: "/admin/contenido/resenas",
    icon: Star,
    title: "Reseñas",
    body: "Citas reales de Google Maps y el promedio/conteo de reseñas.",
  },
  {
    href: "/admin/contenido/negocio",
    icon: Store,
    title: "Negocio",
    body: "Horario, teléfono, WhatsApp, email, redes sociales y decoración de temporada.",
  },
  {
    href: "/admin/contenido/historias",
    icon: BookMarked,
    title: "Historias",
    body: "La narrativa detrás de cada colección mensual del menú — un capítulo por mes.",
  },
];

export default function ContenidoHubPage() {
  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="mb-2 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">
          Contenido del sitio
        </p>
        <h1 className="font-demi text-2xl font-bold text-stellar-white">¿Qué quieres editar?</h1>
        <p className="mt-2 max-w-xl text-sm text-stellar-white/60">
          Estos cambios se publican de inmediato en d-stellar.co, sin redeploy.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CARDS.map(({ href, icon: Icon, title, body }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 rounded-lg border-2 border-line bg-stellar-black-soft p-6 transition-all hover:-translate-y-0.5 hover:border-stellar-blue"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-stellar-blue/15">
                <Icon size={22} className="text-stellar-blue" />
              </span>
              <div className="min-w-0">
                <p className="font-demi text-lg font-bold text-stellar-white">{title}</p>
                <p className="mt-1 text-sm text-stellar-white/60">{body}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
