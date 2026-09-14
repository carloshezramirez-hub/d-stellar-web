# SEO — d-stellar

Working notes for search visibility. For brand/content/architecture context
see `PROJECT_NOTES.md` — this file only covers SEO-specific implementation
and the backlink strategy.

## Technical SEO — what's implemented

- **Sitemap**: `app/sitemap.ts`, dynamic, pulls every static route + every
  `data/events.ts` slug + every `data/menu-history.ts` slug automatically,
  with ES/EN `alternates.languages` on each entry. New events/historias
  entries appear in the sitemap for free — no manual step needed.
- **Robots**: `app/robots.ts` allows all crawling and points at the sitemap.
  No routes are currently blocked — there's nothing in this app that
  shouldn't be public (no admin/staging routes exist in this repo).
- **Canonical + hreflang**: every indexable page sets `alternates.canonical`
  and `es`/`en`/`x-default` language alternates, always as absolute-from-root
  paths, always HTTPS via `SITE_URL` in `data/site.ts`.
- **Open Graph / Twitter cards**: `lib/seo.ts` → `pageMetadata()` is the
  single place every page's `generateMetadata` builds its `openGraph`/
  `twitter` objects from. This matters because Next.js **replaces** the
  `openGraph` object per route segment rather than deep-merging it — a page
  that only set `openGraph.url` would silently lose the site-wide
  `og:site_name`/`og:locale` set in the root layout. Before this fix, every
  page below the homepage (`/menu`, `/about`, `/visit`, `/press`, `/pickup`,
  `/historias`, `/events`, and both dynamic detail pages) had `og:url`
  pointing at the homepage, since there was no per-page fallback — fixed
  2026-09-14, see git history around that date.
- **Structured data** (`lib/schema.ts`, real data only, no fabricated
  ratings): `CafeOrCoffeeShop` (more accurate than generic `LocalBusiness`
  for a cookie shop that also serves coffee/drinks) + `WebSite` on every
  page (root layout), `BreadcrumbList` per page, `Menu`/`MenuSection`/
  `MenuItem` on `/menu`, `Event` on event detail pages. `aggregateRating` on
  `CafeOrCoffeeShop` is kept in sync with `data/reviews.ts` →
  `googleReviewStats`, itself sourced from the business's real Google Maps
  profile — never a placeholder.
- **Google Search Console**: no property exists yet for `www.d-stellar.co`.
  `app/[locale]/layout.tsx` reads an optional `GOOGLE_SITE_VERIFICATION` env
  var and renders the verification meta tag only if it's set — see "Needs
  Carlos" below for the manual step.

## Needs Carlos (can't be done from this repo)

1. **Search Console property** — create the `www.d-stellar.co` property at
   search.google.com/search-console, verify via the HTML tag method, put
   the verification code in Vercel as `GOOGLE_SITE_VERIFICATION`
   (Production + Preview, same place `NEXT_PUBLIC_GA_MEASUREMENT_ID` lives),
   redeploy, then submit `https://www.d-stellar.co/sitemap.xml`.
2. **`d-stellar.com` (the old WordPress/WooCommerce site)** — still live,
   never decommissioned, not redirected to `www.d-stellar.co`. Needs a
   domain-level 301 at the Hostinger/DNS layer, or pointing the domain at
   Vercel — both outside this codebase. See `PROJECT_NOTES.md` for the full
   writeup of this issue.
3. **Real event photography** — `la-mas-draga-viewing-party`,
   `pride-block-party`, and the new `cata-galletas-septiembre` still use the
   gradient+logo SVG placeholder (`scripts/gen-event-placeholders.mjs`).
   Swap in real photos when available — no code change needed beyond
   updating `coverImage` in `data/events.ts`.
4. **Cata de Galletas — Septiembre**: the exact start time and a capacity
   number weren't provided, so they were deliberately left out rather than
   invented (`timeKnown: false`, no `capacity` field) — see `data/events.ts`.
   Add them (and a real event photo) as soon as they're confirmed.

## Backlink strategy

No PBNs, no bulk link buying, no directory spam. Everything below is either
already working (the press list) or a realistic ask for a real, in-person
Condesa business with an active event calendar and an LGBTQ+ community
angle that's genuinely newsworthy — that angle is what already got 10 real
placements (`data/press.ts`), so it's the strongest lever to keep pulling.

### Already earned (keep growing this list)

`data/press.ts` has 10 real, verified placements — El Economista, Cronista,
Yahoo Noticias, Almomento, Sociedad Noticias, Nómada Capital, Style by
ShockVisual, Monchi Time, Godínez Chilangxs, Real Estate Market & Lifestyle,
Índice Corporativo. Every one of them covered the same two angles: **(a)**
d-stellar as an LGBTQ+/trans safe space built out of a cookie business, and
**(b)** the monthly-rotating menu as a concept-store hook. Both angles are
repeatable news pegs — pitch the *next* one (a new monthly collection, a
notable event, an anniversary) to outlets that already covered similar
Mexico City small-business/LGBTQ+ stories, not just these same 10.

### Priority 1 — directories that convert real foot traffic (do first, low effort)

- **Google Business Profile** — verify/complete it if not already done;
  this is also what the footer's "Añadir como fuente preferida" Google
  button and the `hasMap`/`aggregateRating` schema ultimately point back to.
- **Instagram/TikTok bio links and Linktree-style hub** — `@dstellarmx` on
  both platforms already exists (`data/site.ts` → `social`); make sure the
  bio link always points at `www.d-stellar.co`, not the old `.com` or a
  raw Instagram grid.
- **LGBTQ+-specific local directories**: CDMX/Mexico-focused LGBTQ+ business
  directories and "queer-friendly spots" city guides (the kind that already
  covers Condesa/Roma nightlife and cafés) — a natural fit given the
  trans-safe-space positioning that's already core to the brand.
- **Foodie/café discovery apps and guides** that list independent CDMX
  cafés and bakeries (the kind Monchi Time and Nómada Capital readers use).

### Priority 2 — press (the proven channel)

- **Re-pitch the same 10 outlets** for the next real news peg: a new
  monthly cookie collection launch, an anniversary, a notable event
  (Pride Block Party is an annual peg), or a milestone (review count,
  years open). Journalists who've covered you once are the easiest second
  placement.
- **Food/culture verticals not yet covered**: pitch outlets in the same
  tier as the existing list (business/lifestyle press, not just food
  press) — d-stellar's story is as much "small business + community" as
  it is "bakery," which is why outlets like Real Estate Market & Lifestyle
  and Índice Corporativo picked it up.
- **LGBTQ+ press specifically** — the existing placements are general
  business/lifestyle outlets that happened to cover the LGBTQ+ angle;
  LGBTQ+-focused Mexican outlets (that actually name d-stellar, not
  generic "queer-friendly spots in CDMX" roundups — see the note in
  `data/press.ts` about discarded roundup links) are still an open lane.

### Priority 3 — events and collaborations (natural, contextual links)

- **Pabellón Nuevo León neighbors** — Pride Block Party already involved
  neighboring shops; cross-promotion with those businesses (mutual links
  from their own sites/social, joint event pages) is a real, relevant,
  easy-to-get link with zero cold outreach required.
- **Drag/culture partners** — the "La Más Draga" viewing parties and the
  "Todas las Más 2" weekly watch series are collaborations with an existing
  show/community; ask whether the show's own channels or fan communities
  can link to the event recap or the venue.
- **Authors/creators who've used the space** — the IDILIO book presentation
  and poetry workshop is exactly this kind of thing: ask the author/
  publisher to link to d-stellar as the venue when they write about the
  event themselves.
- **Ingredient/product suppliers** — vendors named in the menu (kosher
  cacao, specific tea/matcha suppliers, etc., once identified) sometimes
  list the cafés that serve their product — worth checking which of
  d-stellar's suppliers do this.

### Priority 4 — linkable content (longer-term, needs no outreach)

- **`/historias`** is already linkable content by design — each monthly
  narrative is a real editorial piece, not a product page, which is
  exactly the kind of page food bloggers and city guides cite instead of
  just linking the homepage. Worth mentioning specifically when pitching
  press — it's more citable than "here's our menu."
- **Event recap posts** — a short recap (with real photos) after events
  like the new Cata de Galletas gives partners/attendees something
  specific to link back to instead of just "d-stellar CDMX."

### What to avoid

No link farms, no PBNs, no paid link placements on unrelated/low-quality
sites, no reciprocal-link schemes, no fabricated "featured in" badges. Every
backlink target above is either already a real relationship (press,
neighbors, event partners) or a legitimate directory a real Condesa
business belongs in.
