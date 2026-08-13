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

### Typography — Adobe Fonts gap (see "Missing assets")

Official: **Franklin Gothic URW Demi** (display) + **Coordinates Variable
Regular** (body), both Adobe Fonts/Typekit — no kit is configured in this
project, so they cannot load. Fallbacks, chosen to preserve intent:

- Display (`font-display`, huge headlines): **Big Shoulders** — a condensed
  American-gothic face in the same Chicago-flag/Franklin-Gothic lineage.
- Demi stand-in (`font-demi`, subheads/nav/labels at sizes too small for the
  condensed display face): **Archivo**, weight 700–800.
- Body (`font-body`): **Inter**.
- Mono (`font-tag`, eyebrows/prices/phone): **IBM Plex Mono** — this one isn't
  a guess: it's the actual mono face used in d-stellar's own presentation
  deck.

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
instruction not to apply it everywhere for legibility.

## What d-stellar actually is

- Cookie shop at **Av. Nuevo León 217, Hipódromo Condesa, CDMX**, inside
  **Pabellón Nuevo León** — the entrance is genuinely easy to miss, which is
  why `/visit` walks through it as three photographed steps. Open daily,
  **11:00–19:00** (Instagram bio; no published day-by-day breakdown — verify
  against Google Business Profile before tightening the schema.org hours).
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

## Architecture

- `app/[locale]/...` — `next-intl` `as-needed` prefix: Spanish at the root, no
  prefix; English under `/en`. `proxy.ts` (Next 16 rename of `middleware.ts`)
  runs locale negotiation.
- `data/site.ts` — address, hours, phone, socials, amenities. Single source
  read by schema.org, footer, and `/visit`.
- `data/menu.ts` — `MenuSection[]` with an `accent` field (one of the 7 brand
  colors) driving the category color-block on `/menu`. See "Updating content"
  below.
- `data/events.ts` — `EventRecord[]`. See "Updating content."
- `data/cookie-calendar.ts` — `CalendarMonth[]`, the monthly cookie archive
  rendered on `/calendar`. Separate from `data/menu.ts` on purpose: `menu.ts`
  only ever holds the *current* rotation, this file keeps every past month
  on the record. `CalendarCookie` has no `priceMXN` on purpose — `/calendar`
  is a flavor archive, not a price list; current prices live on `/menu` only.
- `data/press.ts` — `PressMention[]`, real third-party coverage rendered on
  `/press` (media-only page — no reviews there, see below). Every entry must
  be a verified, live URL that actually names "d-stellar" — several roundup
  articles were checked and discarded during research because they didn't.
  Don't add a listicle link on the strength of its title alone. Each entry
  also carries a `logo` path into `public/press-logos/` — real outlet
  logos, not fabricated: `el-economista.svg` and `cronista.png` are the
  outlets' own files from Wikimedia Commons (public-domain/no-threshold-of-
  originality, trademark still applies), `almomento.png` was pulled directly
  from the `<header>` of almomento.mx. Rendered on a white chip
  (`bg-stellar-white`) in the press cards since El Economista's wordmark is
  black and invisible on the dark theme otherwise. New mention → source a
  real logo the same way before adding the entry.
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
- `/private-events` form has **no backend** — submitting opens a pre-filled
  `mailto:` to `BUSINESS.email`. Swap in a real endpoint (Resend, Formspree)
  when ready; the form markup won't need to change.

## Updating content

**Monthly cookie rotation** — edit `data/menu.ts` → `cookies` section (well,
`gourmet-cookies`): replace the five items' `name`/`description`/`priceMXN`,
update `MENU_MONTH_LABEL`. The homepage marquee reads the same section
automatically. Also push a new entry to `data/cookie-calendar.ts` with the
*outgoing* month's lineup before overwriting `menu.ts` — that array is the
archive `/calendar` reads, so it only grows, never gets overwritten.

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

## SEO / GEO

Bilingual hreflang/canonical/alternates on every route. Local SEO intents
(galletas Condesa, best cookies Mexico City, queer-friendly cafe Mexico City,
etc.) worked into titles/descriptions/body copy naturally. JSON-LD is
verifiable-facts-only.

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

1. **Adobe Fonts kit for Franklin Gothic URW Demi + Coordinates Variable.**
   This is the one thing in the manual that genuinely cannot be self-served —
   both are commercial fonts on Typekit. If d-stellar (or Brada Studio) has an
   Adobe Fonts kit ID with these two families active, add the kit's embed
   script to `app/[locale]/layout.tsx` and swap the `font-display`/`font-body`
   variables in `globals.css` to point at the real families. Until then, Big
   Shoulders / Archivo / Inter stand in.
2. **Real event photography** — currently gradient+logo placeholders.
3. **Full-resolution location/product photos** — current files are small
   Photos.app derivatives; fine at current sizes, would look soft any larger.
4. **Day-by-day opening hours, exact coordinates, official phone hours** — to
   verify against Google Business Profile.

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
