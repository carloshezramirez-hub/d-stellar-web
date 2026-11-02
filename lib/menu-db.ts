import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { MenuItem, MenuSection } from "@/lib/menu-types";

let _client: SupabaseClient | null = null;

function getMenuDb(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}

export function isMenuDbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

interface MenuSectionRow {
  slug: string;
  title: { es: string; en: string };
  intro: { es: string; en: string };
  accent: MenuSection["accent"];
  sort_order: number;
}

interface MenuItemRow {
  id: string;
  section_slug: string;
  slug: string;
  name: string;
  description: { es: string; en: string };
  price_mxn: number;
  compare_at_price_mxn: number | null;
  pack_size: number | null;
  tags: MenuItem["tags"] | null;
  image: string | null;
  sort_order: number;
}

function rowToItem(row: MenuItemRow): MenuItem {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceMXN: Number(row.price_mxn),
    compareAtPriceMXN: row.compare_at_price_mxn != null ? Number(row.compare_at_price_mxn) : undefined,
    packSize: row.pack_size ?? undefined,
    tags: row.tags && row.tags.length ? row.tags : undefined,
    image: row.image ?? undefined,
  };
}

function itemToRow(sectionSlug: string, input: MenuItem) {
  return {
    section_slug: sectionSlug,
    slug: input.slug,
    name: input.name,
    description: input.description,
    price_mxn: input.priceMXN,
    compare_at_price_mxn: input.compareAtPriceMXN ?? null,
    pack_size: input.packSize ?? null,
    tags: input.tags ?? null,
    image: input.image ?? null,
    updated_at: new Date().toISOString(),
  };
}

/** Todo el menú, secciones con sus items anidados, en el orden en que se muestran. */
export async function listMenu(): Promise<MenuSection[]> {
  if (!isMenuDbConfigured()) return [];
  const db = getMenuDb();

  const [{ data: sections, error: sectionsError }, { data: items, error: itemsError }] = await Promise.all([
    db.from("menu_sections").select().order("sort_order", { ascending: true }),
    db.from("menu_items").select().order("sort_order", { ascending: true }),
  ]);
  if (sectionsError) throw sectionsError;
  if (itemsError) throw itemsError;

  const itemsBySection = new Map<string, MenuItem[]>();
  for (const row of (items as MenuItemRow[]) ?? []) {
    const list = itemsBySection.get(row.section_slug) ?? [];
    list.push(rowToItem(row));
    itemsBySection.set(row.section_slug, list);
  }

  return ((sections as MenuSectionRow[]) ?? []).map((section) => ({
    slug: section.slug,
    title: section.title,
    intro: section.intro,
    accent: section.accent,
    items: itemsBySection.get(section.slug) ?? [],
  }));
}

export async function getMenuSection(slug: string): Promise<MenuSection | null> {
  const menu = await listMenu();
  return menu.find((section) => section.slug === slug) ?? null;
}

export async function createMenuSection(input: Omit<MenuSection, "items">): Promise<void> {
  const db = getMenuDb();
  const { data: existing } = await db.from("menu_sections").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const nextOrder = existing?.[0] ? Number(existing[0].sort_order) + 1 : 0;
  const { error } = await db.from("menu_sections").insert({
    slug: input.slug,
    title: input.title,
    intro: input.intro,
    accent: input.accent,
    sort_order: nextOrder,
  });
  if (error) throw error;
}

export async function updateMenuSection(currentSlug: string, input: Omit<MenuSection, "items">): Promise<void> {
  const db = getMenuDb();
  const { error } = await db
    .from("menu_sections")
    .update({ slug: input.slug, title: input.title, intro: input.intro, accent: input.accent, updated_at: new Date().toISOString() })
    .eq("slug", currentSlug);
  if (error) throw error;
}

export async function deleteMenuSection(slug: string): Promise<void> {
  const db = getMenuDb();
  const { error } = await db.from("menu_sections").delete().eq("slug", slug);
  if (error) throw error;
}

export async function reorderMenuSections(slugsInOrder: string[]): Promise<void> {
  const db = getMenuDb();
  await Promise.all(
    slugsInOrder.map((slug, index) => db.from("menu_sections").update({ sort_order: index }).eq("slug", slug)),
  );
}

/** `currentSlug` identifica la fila a actualizar (puede ser create si no existe). */
export async function upsertMenuItem(sectionSlug: string, currentSlug: string | null, input: MenuItem): Promise<void> {
  const db = getMenuDb();

  if (currentSlug) {
    const { error } = await db
      .from("menu_items")
      .update(itemToRow(sectionSlug, input))
      .eq("section_slug", sectionSlug)
      .eq("slug", currentSlug);
    if (error) throw error;
    return;
  }

  const { data: existing } = await db
    .from("menu_items")
    .select("sort_order")
    .eq("section_slug", sectionSlug)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = existing?.[0] ? Number(existing[0].sort_order) + 1 : 0;
  const { error } = await db.from("menu_items").insert({ ...itemToRow(sectionSlug, input), sort_order: nextOrder });
  if (error) throw error;
}

export async function deleteMenuItem(sectionSlug: string, slug: string): Promise<void> {
  const db = getMenuDb();
  const { error } = await db.from("menu_items").delete().eq("section_slug", sectionSlug).eq("slug", slug);
  if (error) throw error;
}

export async function reorderMenuItems(sectionSlug: string, slugsInOrder: string[]): Promise<void> {
  const db = getMenuDb();
  await Promise.all(
    slugsInOrder.map((slug, index) =>
      db.from("menu_items").update({ sort_order: index }).eq("section_slug", sectionSlug).eq("slug", slug),
    ),
  );
}

export type { MenuItem, MenuSection } from "@/lib/menu-types";
