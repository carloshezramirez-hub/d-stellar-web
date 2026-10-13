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
- **FAQ page + FAQPage schema** (2026-10-12): `/faq` (ES/EN), content in
  `messages/{es,en}.json` → `faq`, schema via `lib/schema.ts` →
  `faqSchema()`. Linked from header + footer nav, in the sitemap. This is
  the main on-site lever for AI search engines (ChatGPT/Perplexity/Gemini)
  to quote direct answers instead of just the homepage summary — every
  answer is sourced from facts already elsewhere in the codebase (hours,
  address, pickup flow, vegan rotation, trans-safe-space positioning), no
  new claims invented.
- **`public/llms.txt`** (2026-10-12): factual one-page summary for LLM
  crawlers (GEO), same no-fabrication sourcing as the FAQ.
- **`LocalBusiness` schema enriched** (2026-10-12): added `founder` (Hernán
  Castilla, Eduardo Hernández) and `foundingDate` (2024) to
  `localBusinessSchema()` for better entity recognition by Google's
  Knowledge Graph and AI answer engines.
- **Review count refreshed** (2026-10-12): `data/reviews.ts` →
  `googleReviewStats.count` updated 148 → 156, matching d-stellar's live
  Google Business Profile at time of writing (verified directly in the
  Google panel, not estimated).
- **Stale homepage menu teaser fixed** (2026-10-13): triggered by auditing
  why ChatGPT and Gemini both initially omitted d-stellar from "mejores
  galletas CDMX" answers. The homepage's menu-teaser label was a hardcoded
  i18n string (`home.menuTeaserTitle` = "La propuesta de septiembre" /
  "September's lineup") that never got updated past September, while
  `/menu` itself was already correctly showing October/November — a real
  content-freshness inconsistency an AI crawler could plausibly have hit.
  Fixed in `app/[locale]/page.tsx` to read `MENU_MONTH_LABEL` from
  `data/menu.ts` directly (the same source `/menu` uses) instead of a
  separately-maintained string, so it can't drift out of sync again. Dead
  `menuTeaserTitle` keys removed from `messages/{es,en}.json`.
- **FAQ entry targeting "best cookies in CDMX"-style queries** (2026-10-13):
  added `faq.items` → "¿Qué hace diferentes a las galletas de d-stellar en
  CDMX?" / "What makes d-stellar's cookies different in Mexico City?" —
  answer-first, quotable, sourced only from facts already verified
  elsewhere (monthly rotation, vegan options, trans-safe-space positioning,
  5.0★/156 reviews), no claim of being objectively "the best" and no
  disparagement of competitors. Picked up automatically by the existing
  `faqSchema()` → `FAQPage` JSON-LD, no new page/route needed.

### AI-visibility audit log (ChatGPT + Gemini, 2026-10-13)

Carlos asked ChatGPT and Gemini "¿cuáles son las mejores galletas en CDMX?"
Both omitted d-stellar on first answer, then agreed on audit it was a real
gap, not a quality judgment. Root causes identified and status:

| Cause | Status |
|---|---|
| Crawler access (OAI-SearchBot/GPTBot/Google-Extended) | Already fine — `app/robots.ts` is `allow: "/"` for `userAgent: "*"`, nothing in `proxy.ts` blocks bots |
| Stale/inconsistent content (Sept. teaser vs. Oct/Nov menu) | Fixed above |
| No answer-first quotable differentiator on-site | Fixed above (FAQ entry) |
| Structured data (LocalBusiness/FAQPage/Menu schema) | Already done (see above) |
| `llms.txt` for LLM crawlers | Already done (2026-10-12) |
| Independent editorial mentions ("mejores galletas CDMX" roundups) | **Needs Carlos** — this is the single highest-leverage lever both audits agree on, and it can't be done from this repo. 3 drafted pitches waiting in `PRESS_PITCHES_PENDING.md` |
| Google Business Profile completeness/reviews | **Needs Carlos** — manual, external to repo |
| YouTube presence | **Gap, needs Carlos** — Gemini specifically flagged this; no channel exists yet (checked `data/site.ts` → `social`, nothing there). Even a short vertical video per monthly collection, cross-posted from the existing IG/TikTok content, would give Google/Gemini's AI Overviews something to cite that isn't text |
| Old `d-stellar.com` WordPress site still live, unredirected | **Needs Carlos** — DNS/Hostinger level, confuses brand-entity consistency for AI engines too, not just Google |

**Test queries to re-run monthly** (same list proposed by both ChatGPT and
Gemini) — track in this table whether d-stellar appears, at what rough
position, and which sources get cited:

- ¿Cuáles son las mejores galletas en CDMX?
- ¿Dónde comprar las mejores cookies gourmet en la Condesa?
- ¿Qué cookie shops de CDMX tienen sabores originales?
- ¿Dónde venden galletas artesanales recién horneadas en CDMX?
- ¿Qué lugares tienen cookies veganas en Ciudad de México?
- ¿Qué cafeterías o galleterías de la Roma-Condesa recomiendan para comer cookies?

Don't read too much into a single run — AI answers vary by session, model
version, and whether the query triggers a live web search at all.

## Needs Carlos (can't be done from this repo)

1. ~~**Search Console property**~~ — **done 2026-10-12.** Domain property
   `d-stellar.co` added under the sweetuniversecompany@gmail.com account,
   auto-verified instantly via DNS (Google already trusted the domain's
   nameserver provider — no manual TXT/HTML-tag step needed). Sitemap
   submitted. Indexing requested for the new `/faq` page. Findings from
   the first real data pull: brand queries (d-stellar, dstellar) convert
   fine; non-branded discovery queries (`galletas cerca de mi`, `galletas`,
   `cafe stellar`) get impressions but **zero clicks** — ranking too low
   to be found by people who don't already know the brand. Also:
   `/en` and `/en/menu` get dramatically more impressions than their `/es`
   equivalents (440 vs 294 for home, 211 vs 10 for menu) — Condesa's
   expat/tourist search volume may be larger than assumed, or there's an
   indexing imbalance worth investigating further. Follow-up: proper
   competitor keyword-gap research (needs a tool like Ahrefs/SEMrush —
   not fabricated from memory) to target the "galletas cerca de mi"-style
   queries specifically.
2. **`d-stellar.com` (the old WordPress/WooCommerce site)** — still live,
   never decommissioned, not redirected to `www.d-stellar.co`. Needs a
   domain-level 301 at the Hostinger/DNS layer, or pointing the domain at
   Vercel — both outside this codebase. See `PROJECT_NOTES.md` for the full
   writeup of this issue.
3. **Real event photography** — `la-mas-draga-viewing-party` and
   `pride-block-party` still use the gradient+logo SVG placeholder
   (`scripts/gen-event-placeholders.mjs`). `5-latidos` uses a real studio
   product photo (`cookie-display-lit.webp`) instead, but a real photo from
   the blind-tasting event itself would be better once one exists — no code
   change needed beyond updating `coverImage` in `data/events.ts`.

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

**2026-10-12 competitor gap found:** d-stellar has real organic coverage (a
TikTok from @cdmxsecreta) but is absent from the written "mejores galletas
CDMX" roundup articles that Doukie Cookies and others already own — exactly
the kind of placement that's the #1 AI-visibility citation factor. Three
drafted-but-unsent pitches (gourmetdemexico.com.mx, thehappening.com, El
Universal) are in `PRESS_PITCHES_PENDING.md` — Carlos reviews and sends
himself.

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
