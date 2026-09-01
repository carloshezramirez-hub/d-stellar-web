# d-stellar — Project Notes

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4, bilingual (ES default / EN under `/en`).
This is a **full visual and functional rebuild on the official brand identity**
(`Manual-D-stellar.pdf`, by Brada Studio), not a generic redesign — see "Brand"
below for the source of every design decision.

## Brand

### Source of truth

`Manual-D-stellar.pdf` (30 pages, "MANUAL DE IDENTIDAD") is canonical. The
80-page `dstellar-pres (1).pdf` is Brada Studio's earlier proposal deck — same
system, plus astronomy mood-boarding research; it was skimmed to confirm it
converges on the same manual, not treated as a second source of truth.

### Colors — exact, from the manual's "COLORES" page

```
--stellar-black:  #000000
--stellar-white:  #FFFFFF
--stellar-green:  #00FF00
--stellar-blue:   #243AD2
--stellar-pink:   #FF70E0
--stellar-red:    #FC000F
--stellar-purple: #A21FFE
```

Defined in `app/globals.css`. Black/white are the structural base; the five
secondary colors are used as flashes — category blocks on `/menu`, the value
cards on the homepage, event gradients — never as a permanent rainbow. **Green
and pink fail WCAG AA for small text on black** — they're used for large
display type, black-text-on-color blocks, and borders/icons only, never body
copy (see the comment block at the top of `globals.css`).

### Logotype

The bubble wordmark is the **official vector logo**, extracted at 600dpi from
the manual (not redrawn, not approximated with a lookalike font) —
`public/brand/logos/dstellar-wordmark-{black,white}.png`. Used as-is in the
header, footer, and OG image. Do not stretch, recolor outside black/white, or
rebuild it with a system font — the manual is explicit about this
("USOS CORRECTOS E INCORRECTOS").

### Typography — real brand fonts, self-hosted (fixed 2026-08-14)

The client supplied the actual licensed font files (Process Type Foundry /
URW), so this no longer needs an Adobe Fonts kit or a Google Fonts stand-in:

- Display + demi (`font-display`, `font-demi` — huge headlines *and*
  subheads/nav/labels, one weight): **Franklin Gothic URW Demi**,
  `fonts/franklin-gothic-urw-demi.otf`. It's a normal-proportion Demi, not
  ultra-condensed like the old Big Shoulders stand-in, so it no longer needs
  a separate small-size substitute — verified against every page's mobile
  (375px) layout with no overflow after the swap.
- Body (`font-body`): **Coordinates Variable**,
  `fonts/coordinates-variable.otf` — a real variable font (Light through
  Bold named instances). `body { font-weight: 300 }` in `globals.css` uses
  its actual Light instance, not an approximation.
- Mono (`font-tag`, eyebrows/prices/phone): **IBM Plex Mono** (Google
  Fonts) — this one was never a guess, it's the real mono face from
  d-stellar's own presentation deck, unchanged.

Wired via `next/font/local` in `app/[locale]/layout.tsx` (not
`next/font/google` — these aren't hosted fonts). If the font files ever need
replacing, they live only in `fonts/` at the repo root; nothing else
references the old Big Shoulders/Archivo/Inter Google Fonts imports anymore.

### Texture & graphic elements — extracted, not redrawn

All from the manual, extracted as real assets (never Unicode stars or
downloaded icon-pack substitutes):

- `public/brand/textures/texture-{black,cream}.webp` — the official
  "D-STELLAR" swirl texture (full-res raster pulled from the PDF's embedded
  image). Used sparingly: footer background, event page background.
- `public/brand/illustrations/` — the two line-art "star people",
  starburst compositions, and the "GLOW" wordmark, extracted at 600dpi and
  cleaned to transparent PNG (black + white variants).
- `public/brand/icons/` — globe, triangle, the cross/starburst mark, the
  circled "CDMX" lockup, and the pixel-art star (used everywhere a bullet or
  favicon needs a star — see `app/icon.tsx`).
- `scripts/gen-event-placeholders.mjs` — regenerates the event cover
  placeholders (official gradient + real logo) if needed.

### Voice

Pulled directly from the manual, not paraphrased:
tagline **"Junt★s brillamos más"**; the values stack
**"Auténtic★s. Original★s. Inquebrantables. Icónic★s. Desafiantes."**; the
brand statement **"Una marca transgresora, imparable y amable, donde te
puedes expresar con libertad y sin miedo a ser juzgad★. Una comunidad, un
universo propio."**; and the campaign line **"Bend the rules. Star the
show."** on `/events`. The inclusive star (replacing gendered `a`/`o`) is used
only in these editorial statements, never in body copy — per the manual's own
instruction not to apply it everywhere for legibility. Two explicit client-
requested exceptions (2026-08-14 feedback deck): `home.valuesTitle` ("Un
espacio abierto para tod★s") and the La Más Draga event description ("vemos
el episodio junt★s") — both approved by name, don't revert to `todes`/
`juntos` even though they read as body copy rather than a headline statement.

### Body font weight

`body { font-weight: 300 }` in `globals.css` — client asked for "Coordinates
Variable Light" (2026-08-14); since Coordinates Variable itself isn't
licensed here (see above), this applies Light weight to the already-adopted
Inter fallback instead of sourcing a new typeface. Headings/labels are
unaffected since they set their own explicit weight classes (`font-black`,
`font-bold`, etc.).

## What d-stellar actually is

- Cookie shop at **Av. Nuevo León 217, Hipódromo Condesa, CDMX**, inside
  **Pabellón Nuevo León** — the entrance is genuinely easy to miss, which is
  why `/visit` walks through it as three photographed steps. Hours (per the
  owner, 2026-08-14): **11:00–19:00 daily, except Tuesday (opens 14:00) and
  Wednesday/Friday (opens 12:00)** — closing time is always 19:00. Source of
  truth is `BUSINESS.hours` + `BUSINESS.hoursExceptions` in `data/site.ts`,
  which both `lib/schema.ts` (per-day `OpeningHoursSpecification` array) and
  `visit.hoursBody` / `footer.hours` in `messages/*.json` must stay in sync
  with if the schedule changes again.
- Founded **2024** by **Hernán Castilla** and **Eduardo Hernández** (verified
  from their own printed business cards inside the manual — LinkedIn's public
  copy says "Eduardo de Castilla," the business card is more likely correct
  and is what's used here), operating as **The Sweet Universe Company**.
- **Phone `+52 55 4633 2352`** — this is not a guess or a personal cell
  scraped from somewhere private: it's printed as the brand's own public
  contact number on the manual's secondary logo lockup, next to the
  `@dstellar` handle. Used for `tel:` links and the LocalBusiness schema.
- Menu names, prices, and descriptions are transcribed directly from the
  in-store menu board photos (see `data/menu.ts`) — every price is real as of
  August. "Agua de Cuarzo" is the current printed name for the Aurora Rosada
  pairing; an older printed booklet called the same drink "Moonbeam Latte" —
  the in-store board (more recent) was trusted over the booklet.

## Photography

16 real photos of the physical space, menu boards, and product were supplied
and are in use — `public/images/location/` (facade, both storefront-door
angles, interior counter, interior lounge, patio), `public/images/products/`
(three cookie-display-shelf angles), `public/images/menu-reference/` (the
photographed menu boards, kept for reference/verification, not currently
rendered as page content since menu data must stay real HTML). Source files
are Photos.app-generated derivatives (360×480 / 768×1024) — good enough for
the card/step sizes they're used at on this site, but visibly soft if anyone
blows one up to a full-bleed hero. Re-export at full resolution from the
original camera roll before using any of them larger than ~700px wide.

**Event cover photography is still a placeholder** (official gradient + logo,
clearly labeled) — no real event photos were supplied. Swap
`data/events.ts` → `coverImage` for real photos when available.

**Entrance walkthrough video** (added 2026-09-01) — `public/videos/como-llegar.mp4`
is a real phone recording supplied by the client (WhatsApp export, 478×850,
h264/aac, ~5.9MB, remuxed with `-movflags +faststart` for progressive
playback, no re-encode/quality loss) showing the actual walk from the street
into the hidden entrance. Rendered on `/visit` right under the 3-step photo
grid via a native `<video controls>` (no autoplay — vertical video with
audio), poster frame at `public/images/location/como-llegar-poster.webp`
(extracted with ffmpeg, not a placeholder). If the client ever sends a
higher-resolution source (not run through WhatsApp's compression), replace
the file in place — no code change needed since the path is fixed.

## Architecture

- `app/[locale]/...` — `next-intl` `as-needed` prefix: Spanish at the root, no
  prefix; English under `/en`. `proxy.ts` (Next 16 rename of `middleware.ts`)
  runs locale negotiation.
- `data/site.ts` — address, hours, phone, socials, amenities. Single source
  read by schema.org, footer, and `/visit`. `phone`/`phoneHref` corrected to
  `+52 55 6502 4440` on 2026-08-14 (the old number on file was wrong).
  `whatsappUrl` is the real contact CTA on `/pickup` — there's no cell signal
  in-store for calls, so `tel:` links are deliberately avoided there.
- `data/menu.ts` — `MenuSection[]` with an `accent` field (one of the 7 brand
  colors) driving the category color-block on `/menu`. See "Updating content"
  below. `MenuItem.packSize` + `compareAtPriceMXN` are cookie-packs-only:
  `packSize` drives the per-cookie flavor pickers in `PickupOrderForm`
  (customers choose which cookies fill their 3/5/10-pack, repeats allowed),
  `compareAtPriceMXN` is the struck-through "before discount" price
  (`packSize × single-cookie price`) shown next to the pack price on `/menu`.
- `data/events.ts` — `EventRecord[]`. See "Updating content."
- `data/menu-history.ts` — `MonthlyStory[]`, rendered on `/historias` (was
  `/calendar` until 2026-08-16, when the client sent 9 months of real
  monthly narratives — see "Historias del menú" in "Updating content" for
  where that content lives and how to add the next chapter). Separate from
  `data/menu.ts` on purpose: `menu.ts` only ever holds the *current*
  rotation, this file is the permanent archive. Sorted newest-first;
  `chapterNumber` counts up chronologically from December 2025 (1) so
  prev/next navigation on the detail page reads forward in time even
  though the array itself is newest-first — see the comment in
  `historias/[mes]/page.tsx` before changing that logic.
- `data/press.ts` — `PressMention[]`, real third-party coverage rendered on
  `/press` (media-only page — no reviews there, see below). Every entry must
  be a verified, live URL that actually names "d-stellar" — several roundup
  articles were checked and discarded during research because they didn't.
  Don't add a listicle link on the strength of its title alone. Each entry
  also carries an optional `logo` path into `public/press-logos/` — real
  outlet logos, not fabricated: `el-economista.svg`, `cronista.png`, and
  `yahoo.svg` are the outlets' own files from Wikimedia Commons (public-
  domain/no-threshold-of-originality, trademark still applies);
  `almomento.png`, `sociedad-noticias.png`, `monchi-time.png`, and
  `godin-chilango.png` were pulled directly from each outlet's own site
  (`<header>` logo or, for `style-shockvisual.png`, its favicon — no bigger
  mark exists on that site). Rendered on a white chip (`bg-stellar-white`)
  in the press cards since some wordmarks (El Economista) are black and
  invisible on the dark theme otherwise. `logo` is optional — when a real
  logo genuinely can't be sourced (e.g. Nómada Capital's site lazy-loads its
  logo behind JS with no static URL), omit it and the card falls back to
  the outlet name as plain text; never fabricate a mark. New mention →
  source a real logo the same way before adding the entry, and always
  verify the URL actually names "d-stellar" first — don't add either on the
  strength of the title alone.
- `data/reviews.ts` — `ReviewQuote[]` + `googleReviewStats`, real Google
  Maps review quotes (copied verbatim, lightly trimmed, never invented) and
  the real aggregate rating/count, both supplied by the business owner from
  d-stellar's own Google Maps profile. Rendered as a horizontal scroll-snap
  carousel (`components/sections/reviews-carousel.tsx`) on the **homepage**,
  between the "This isn't just a cookie shop" intro section and the brand
  statement section — moved there from `/press` on 2026-08-13 so `/press` is
  media-only. `googleReviewStats` also feeds `aggregateRating` in
  `lib/schema.ts` → `localBusinessSchema()`. If this array is ever empty,
  the homepage section falls back to a CTA-only card linking out to Google
  Maps — never fill it with placeholder testimonials.
- `messages/es.json` / `messages/en.json` — all copy via `next-intl`. English
  is hand-written for a US tourist audience, not machine-translated.
- `lib/schema.ts` + `components/json-ld.tsx` — JSON-LD: `CafeOrCoffeeShop`,
  `WebSite`, `BreadcrumbList`, `Event`, `Menu`/`MenuSection`/`MenuItem`. No
  fabricated ratings/reviews.
- `app/sitemap.ts` / `app/robots.ts` — dynamic, include ES/EN alternates and
  every event slug automatically.
- `app/[locale]/opengraph-image.tsx`, `app/icon.tsx`, `app/apple-icon.tsx` —
  generated with `next/og`, using the real extracted logo/star assets (read
  from `public/brand` at render time) — no external dependency.
- `lib/analytics.ts` + `components/analytics.tsx` — GA4 loads only if
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. `trackEvent(...)` wired into:
  directions, menu, pickup (mobile action bar), Instagram/TikTok (footer),
  language switch (header). Live GA4 property `G-CC7TRTZ4BR` (stream:
  `www.d-stellar.co`) is set as `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel →
  Production + Preview as of 2026-08-13. Not set locally on purpose (see
  `.env.example`) — the component just renders nothing in dev.
- The private-events form has **no backend** — submitting opens a pre-filled
  `mailto:` to `BUSINESS.email`. Swap in a real endpoint (Resend, Formspree)
  when ready; the form markup won't need to change.
- **`/private-events` was folded into `/events`** (2026-09-01, at the client's
  request to merge the two nav tabs) as a `#private-events` section below the
  upcoming/past events lists — same `privateEvents` translation namespace and
  `PrivateEventForm` component, just rendered inline on
  `app/[locale]/events/page.tsx` instead of a standalone route. The old route
  is gone; `next.config.ts` has permanent redirects from
  `/private-events` → `/events#private-events` (and the `/en` equivalent) so
  old links/bookmarks/search results still land somewhere correct. Header nav
  no longer has a separate "Private events" tab — the footer link and the
  events/[slug] "send inquiry" CTA both point at the `#private-events` anchor
  instead.

## Updating content

**Monthly cookie rotation** — edit `data/menu.ts` → `cookies` section (well,
`gourmet-cookies`): replace the five items' `name`/`description`/`priceMXN`,
update `MENU_MONTH_LABEL`. The homepage marquee reads the same section
automatically.

**Historias del menú** — d-stellar writes an in-house narrative for every
monthly collection (why the theme, what each cookie means) and hands it over
as a `.docx` per month once that month wraps, plus a folder of real photos.
Add the *outgoing* month to `data/menu-history.ts` — `MonthlyStory` (title,
hook, intro, one `CookieStory` per flavor with `tagline` + `story`, a closing
section, `oneLiner`) — **before** overwriting `menu.ts` for the new month, so
nothing gets lost. Push the new entry to the *front* of the array (it's
newest-first) and bump `chapterNumber` by one. Never invent copy here if a
month's `.docx` isn't ready yet — leave that month out of the archive until
the real write-up arrives, the way August 2026 was left out at launch.
Photos: pick 2–4 from the month's folder, run through
`ImageOps.exif_transpose` (phone photos come in every orientation) before
cropping — see the git history around 2026-08-16 for the exact script — save
to `public/images/historias/{slug}/` as `hero.webp` + `gallery-N.webp`. Every
paragraph needs both `es` and `en` — this content is real editorial writing
supplied by the client, not filler, so translate it properly, don't
machine-summarize it down to nothing.

**New press mention** — add to `data/press.ts`: `outlet`, `title`, `url`,
`dateLabel`, bilingual `summary`. Verify the URL actually names "d-stellar"
before adding it — several LGBTQ+/bakery roundups were checked and discarded
because they didn't.

**New Google review** — add to `data/reviews.ts`: `author`, `rating`,
`quote` (copied verbatim from Google Maps), optional `dateLabel`. Never
invent a quote, rating, or review count.

**Focaccias** — same file, `focaccias` section; the "melt del día" item has no
fixed description on purpose (ask-in-store), keep it that way unless it
becomes a fixed recipe.

**Prices** — every `MenuItem.priceMXN` and `EventRecord.priceMXN` is a plain
number, edit directly.

**New event** — add to `data/events.ts`: `slug` (becomes the URL), `dateISO`
(with `-06:00` offset), `summary`, `description` (paragraphs), `includes`,
`capacity`, optional `priceMXN`, a `coverImage` (real photo if you have one,
otherwise regenerate a placeholder via
`node scripts/gen-event-placeholders.mjs` after adding an entry to that
script), and `status: "upcoming" | "past"` (flip manually once it's over —
there's no automatic date-based sorting). Sitemap, JSON-LD, and the Google
Calendar link all derive from this automatically.

`dateISO`, `capacity`, and `includes` are all optional (added 2026-08-16 for
retroactively-documented past events where those details were never
tracked) — don't invent a time, headcount, or perk list to fill them in.
When even the day is unknown, omit `dateISO` entirely and set `monthLabel`
instead (`{ es: "Julio 2026", en: "July 2026" }`); when the day is known but
the hour isn't, keep `dateISO` at midnight and set `timeKnown: false` so the
formatted date drops the time instead of showing a fake one. The "Agregar al
calendario" button only renders for `status: "upcoming"` events with a real
`dateISO` — past events never get one, even if they have a full timestamp,
since adding a past event to your calendar makes no sense. `externalUrl` is
an optional CTA button (labeled "Instagram" today, but generic) linking out
to a real social post about the event, when one exists.

## SEO / GEO

Bilingual hreflang/canonical/alternates on every route. Local SEO intents
(galletas Condesa, best cookies Mexico City, queer-friendly cafe Mexico City,
etc.) worked into titles/descriptions/body copy naturally. JSON-LD is
verifiable-facts-only.

## Fixed: language-switch crash on dynamic routes

`components/layout/header.tsx`'s locale-switch link used
`<Link href={pathname as never} locale={otherLocale}>`, where `pathname`
comes from next-intl's `usePathname()`. On a **static** route that's the
resolved path (`/menu`), fine — but on a **dynamic** route (`/events/[slug]`)
`usePathname()` returns the unresolved *template*, and next-intl's `Link`
then throws `Insufficient params provided for localized pathname` trying to
compile `/events/[slug]` with no params. This broke client-side hydration on
every event detail page (caught during the 2026-08-14 pass — silent in
production builds' initial HTML, but the language switcher crashed the whole
page on mount). Fixed by also reading `useParams()` (from `next/navigation`)
and passing `href={{ pathname, params } as never}` — works for both static
routes (empty `params`) and dynamic ones. If you add another `/foo/[slug]`
style route, this pattern already covers it; no per-route change needed.

## Known upstream issue (not app code)

Every page throws a non-fatal console error on first paint:
`Failed to execute 'appendChild' on 'Node': missing ) after argument list`.
Isolated during QA on the previous build: reproduces on a bare page with zero
custom `<script>` tags, so it's a Next.js 16.3 (Turbopack) + React 19.2-canary
runtime issue, not this codebase. Doesn't break hydration — mobile menu,
language switch, and forms all verified working via Playwright on both the
previous and this redesigned build. Worth re-checking after the next Next.js
patch release.

## Missing assets — needs your intervention

1. ~~Adobe Fonts kit~~ — resolved 2026-08-14, see "Typography" above.
2. **Real event photography** — partially resolved 2026-08-16: the three
   events added from `Eventos Dstellar.pdf` (`todas-las-mas-2`,
   `presentacion-video-musical`, `idilio-taller-poesia`) use real photos
   extracted straight out of that PDF (`pdfimages`, cropped to 16:9). The
   two original flagship events (`la-mas-draga-viewing-party`,
   `pride-block-party`) still use the gradient+logo SVG placeholder.
3. ~~Full-resolution product photos~~ — partially resolved 2026-08-14. The
   client shared a real studio shoot (`Fotos d-stellar estudio/`, ~1667×2500,
   professional light/shadow work) — three of the lowest-quality slots were
   swapped in from it (center-cropped + re-encoded, originals not committed):
   `public/images/products/cookie-display-dark.webp` (wall-mounted shelf
   with the star cookies — same subject as before, just sharp and level now),
   `cookie-display-bright.webp` (hand piping cream onto a cookie — home
   intro section), `cookie-display-lit.webp` (three cookies in the branded
   box — home photo strip). The shoot is *studio product photography only* —
   no location/interior/exterior shots — so `public/images/location/*` still
   needs real photography; still small Photos.app derivatives, fine at
   current sizes, would look soft any larger. The rest of the shoot (~30
   more shots: process, packaging, drink pairings, macro detail) is
   unused — good source for future menu/event imagery.
4. **Exact coordinates, official phone hours** — hours themselves are now
   confirmed (see "What d-stellar actually is"); coordinates are still
   block-approximate, verify against Google Business Profile.

## Deploy

```bash
npm run lint
npm run build
```

Vercel: connect the GitHub repo, framework preset "Next.js" (auto-detected).
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in the Vercel project (Production +
Preview) — see "Key files" → analytics.

**Domain:** `d-stellar.com` currently points at the old WordPress "coming
soon" site — do not repoint DNS without explicit confirmation.
