import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { MonthlyStory, CookieStory, GalleryImage } from "@/lib/historias-types";

let _client: SupabaseClient | null = null;

function getHistoriasDb(): SupabaseClient {
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

export function isHistoriasDbConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

interface StoryRow {
  id: string;
  slug: string;
  chapter_number: number | null;
  month_label: { es: string; en: string };
  title: { es: string; en: string };
  hook: { es: string; en: string };
  flavor_names: string[];
  section_eyebrow: { es: string; en: string };
  section_title: { es: string; en: string };
  intro: { es: string[]; en: string[] };
  closing_eyebrow: { es: string; en: string };
  closing_title: { es: string; en: string };
  closing: { es: string[]; en: string[] };
  one_liner: { es: string; en: string };
  hero_image: string;
  hero_alt: { es: string; en: string };
  sort_order: number;
}

interface CookieRow {
  id: string;
  story_id: string;
  number: string;
  name: string;
  tagline: { es: string; en: string };
  story: { es: string[]; en: string[] };
  pull_quote: { es: string; en: string } | null;
  sort_order: number;
}

interface GalleryRow {
  id: string;
  story_id: string;
  src: string;
  alt: { es: string; en: string };
  sort_order: number;
}

function rowToCookie(row: CookieRow): CookieStory {
  return {
    number: row.number,
    name: row.name,
    tagline: row.tagline,
    story: row.story,
    pullQuote: row.pull_quote ?? undefined,
  };
}

function rowToGallery(row: GalleryRow): GalleryImage {
  return { src: row.src, alt: row.alt };
}

function rowToStory(row: StoryRow, cookies: CookieStory[], gallery: GalleryImage[]): MonthlyStory {
  return {
    slug: row.slug,
    chapterNumber: row.chapter_number ?? undefined,
    monthLabel: row.month_label,
    title: row.title,
    hook: row.hook,
    flavorNames: row.flavor_names ?? [],
    sectionEyebrow: row.section_eyebrow,
    sectionTitle: row.section_title,
    intro: row.intro,
    cookies,
    closingEyebrow: row.closing_eyebrow,
    closingTitle: row.closing_title,
    closing: row.closing,
    oneLiner: row.one_liner,
    heroImage: row.hero_image,
    heroAlt: row.hero_alt,
    gallery,
  };
}

/** Todas las historias, más reciente primero (igual que el array estático original). */
export async function listMenuHistory(): Promise<MonthlyStory[]> {
  if (!isHistoriasDbConfigured()) return [];
  const db = getHistoriasDb();

  const [{ data: stories, error: storiesError }, { data: cookies, error: cookiesError }, { data: gallery, error: galleryError }] =
    await Promise.all([
      db.from("menu_stories").select().order("sort_order", { ascending: false }),
      db.from("menu_story_cookies").select().order("sort_order", { ascending: true }),
      db.from("menu_story_gallery").select().order("sort_order", { ascending: true }),
    ]);
  if (storiesError) throw storiesError;
  if (cookiesError) throw cookiesError;
  if (galleryError) throw galleryError;

  const cookiesByStory = new Map<string, CookieStory[]>();
  for (const row of (cookies as CookieRow[]) ?? []) {
    const list = cookiesByStory.get(row.story_id) ?? [];
    list.push(rowToCookie(row));
    cookiesByStory.set(row.story_id, list);
  }

  const galleryByStory = new Map<string, GalleryImage[]>();
  for (const row of (gallery as GalleryRow[]) ?? []) {
    const list = galleryByStory.get(row.story_id) ?? [];
    list.push(rowToGallery(row));
    galleryByStory.set(row.story_id, list);
  }

  return ((stories as StoryRow[]) ?? []).map((row) =>
    rowToStory(row, cookiesByStory.get(row.id) ?? [], galleryByStory.get(row.id) ?? []),
  );
}

export async function getMonthlyStory(slug: string): Promise<MonthlyStory | null> {
  const all = await listMenuHistory();
  return all.find((s) => s.slug === slug) ?? null;
}

function storyToRow(input: MonthlyStory) {
  return {
    slug: input.slug,
    chapter_number: input.chapterNumber ?? null,
    month_label: input.monthLabel,
    title: input.title,
    hook: input.hook,
    flavor_names: input.flavorNames,
    section_eyebrow: input.sectionEyebrow,
    section_title: input.sectionTitle,
    intro: input.intro,
    closing_eyebrow: input.closingEyebrow,
    closing_title: input.closingTitle,
    closing: input.closing,
    one_liner: input.oneLiner,
    hero_image: input.heroImage,
    hero_alt: input.heroAlt,
    updated_at: new Date().toISOString(),
  };
}

async function replaceCookiesAndGallery(storyId: string, input: MonthlyStory) {
  const db = getHistoriasDb();
  await db.from("menu_story_cookies").delete().eq("story_id", storyId);
  await db.from("menu_story_gallery").delete().eq("story_id", storyId);

  if (input.cookies.length) {
    const { error } = await db.from("menu_story_cookies").insert(
      input.cookies.map((cookie, i) => ({
        story_id: storyId,
        number: cookie.number,
        name: cookie.name,
        tagline: cookie.tagline,
        story: cookie.story,
        pull_quote: cookie.pullQuote ?? null,
        sort_order: i,
      })),
    );
    if (error) throw error;
  }

  if (input.gallery.length) {
    const { error } = await db.from("menu_story_gallery").insert(
      input.gallery.map((img, i) => ({ story_id: storyId, src: img.src, alt: img.alt, sort_order: i })),
    );
    if (error) throw error;
  }
}

export async function createMonthlyStory(input: MonthlyStory): Promise<void> {
  const db = getHistoriasDb();
  const { data: existing } = await db.from("menu_stories").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const nextOrder = existing?.[0] ? Number(existing[0].sort_order) + 1 : 0;

  const { data, error } = await db
    .from("menu_stories")
    .insert({ ...storyToRow(input), sort_order: nextOrder })
    .select("id")
    .single();
  if (error) throw error;

  await replaceCookiesAndGallery(data.id as string, input);
}

/** `currentSlug` identifica la fila a actualizar — `input.slug` puede traer un slug nuevo. */
export async function updateMonthlyStory(currentSlug: string, input: MonthlyStory): Promise<void> {
  const db = getHistoriasDb();
  const { data, error } = await db
    .from("menu_stories")
    .update(storyToRow(input))
    .eq("slug", currentSlug)
    .select("id")
    .single();
  if (error) throw error;

  await replaceCookiesAndGallery(data.id as string, input);
}

export async function deleteMonthlyStory(slug: string): Promise<void> {
  const db = getHistoriasDb();
  const { error } = await db.from("menu_stories").delete().eq("slug", slug);
  if (error) throw error;
}

export type { MonthlyStory, CookieStory, GalleryImage } from "@/lib/historias-types";
