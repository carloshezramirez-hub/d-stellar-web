"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus } from "lucide-react";
import type { MenuSection } from "@/lib/menu-types";

export function MenuSectionList({ menu }: { menu: MenuSection[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function moveSectionSlugs(slugs: string[], from: number, to: number) {
    if (to < 0 || to >= slugs.length) return;
    const next = [...slugs];
    [next[from], next[to]] = [next[to], next[from]];
    setBusy("sections");
    try {
      await fetch("/api/admin/menu/sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: next }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function moveItemSlugs(sectionSlug: string, slugs: string[], from: number, to: number) {
    if (to < 0 || to >= slugs.length) return;
    const next = [...slugs];
    [next[from], next[to]] = [next[to], next[from]];
    setBusy(`${sectionSlug}-items`);
    try {
      await fetch("/api/admin/menu/items/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionSlug, slugs: next }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function deleteSection(slug: string, title: string) {
    if (!confirm(`¿Borrar la sección "${title}" y todos sus productos? Esto no se puede deshacer.`)) return;
    setBusy(slug);
    try {
      await fetch(`/api/admin/menu/sections/${slug}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function deleteItem(sectionSlug: string, slug: string, name: string) {
    if (!confirm(`¿Borrar "${name}"? Esto no se puede deshacer.`)) return;
    setBusy(`${sectionSlug}-${slug}`);
    try {
      await fetch(`/api/admin/menu/items/${sectionSlug}/${slug}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const sectionSlugs = menu.map((s) => s.slug);

  return (
    <div className="grid gap-6">
      {menu.map((section, sectionIndex) => (
        <div key={section.slug} className="border-2 border-line bg-stellar-black-soft p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-demi text-lg font-bold text-stellar-white">{section.title.es}</p>
              <p className="text-xs text-stellar-white/50">{section.title.en} · acento {section.accent}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy === "sections" || sectionIndex === 0}
                onClick={() => moveSectionSlugs(sectionSlugs, sectionIndex, sectionIndex - 1)}
                className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink disabled:opacity-30"
                aria-label="Subir sección"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                disabled={busy === "sections" || sectionIndex === menu.length - 1}
                onClick={() => moveSectionSlugs(sectionSlugs, sectionIndex, sectionIndex + 1)}
                className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink disabled:opacity-30"
                aria-label="Bajar sección"
              >
                <ArrowDown size={14} />
              </button>
              <Link
                href={`/admin/contenido/menu/secciones/${section.slug}`}
                className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink"
                aria-label="Editar sección"
              >
                <Pencil size={14} />
              </Link>
              <button
                type="button"
                disabled={busy === section.slug}
                onClick={() => deleteSection(section.slug, section.title.es)}
                className="border border-line p-1.5 text-stellar-red/80 hover:border-stellar-red disabled:opacity-30"
                aria-label="Borrar sección"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {section.items.map((item, itemIndex) => {
              const itemSlugs = section.items.map((i) => i.slug);
              return (
                <li
                  key={item.slug}
                  className="flex flex-wrap items-center justify-between gap-3 border border-line px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-demi text-sm font-bold text-stellar-white">
                      {item.name} <span className="text-stellar-white/50">· ${item.priceMXN}</span>
                    </p>
                    <p className="truncate text-xs text-stellar-white/50">{item.description.es}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy === `${section.slug}-items` || itemIndex === 0}
                      onClick={() => moveItemSlugs(section.slug, itemSlugs, itemIndex, itemIndex - 1)}
                      className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink disabled:opacity-30"
                      aria-label="Subir"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={busy === `${section.slug}-items` || itemIndex === section.items.length - 1}
                      onClick={() => moveItemSlugs(section.slug, itemSlugs, itemIndex, itemIndex + 1)}
                      className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink disabled:opacity-30"
                      aria-label="Bajar"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <Link
                      href={`/admin/contenido/menu/items/${section.slug}/${item.slug}`}
                      className="border border-line p-1.5 text-stellar-white/70 hover:border-stellar-pink"
                      aria-label="Editar"
                    >
                      <Pencil size={12} />
                    </Link>
                    <button
                      type="button"
                      disabled={busy === `${section.slug}-${item.slug}`}
                      onClick={() => deleteItem(section.slug, item.slug, item.name)}
                      className="border border-line p-1.5 text-stellar-red/80 hover:border-stellar-red disabled:opacity-30"
                      aria-label="Borrar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href={`/admin/contenido/menu/items/nuevo?section=${section.slug}`}
            className="mt-3 inline-flex items-center gap-1 border-2 border-line px-3 py-1.5 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
          >
            <Plus size={14} /> Agregar producto
          </Link>
        </div>
      ))}

      <Link
        href="/admin/contenido/menu/secciones/nueva"
        className="inline-flex w-fit items-center gap-1 border-2 border-line px-4 py-2 text-xs uppercase tracking-widest text-stellar-white/80 hover:border-stellar-pink"
      >
        <Plus size={14} /> Agregar sección
      </Link>
    </div>
  );
}
