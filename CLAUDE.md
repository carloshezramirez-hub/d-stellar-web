@AGENTS.md

# d-stellar — cookie shop (LGBTQ+ safe space), CDMX

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4, bilingüe vía
`next-intl` (ES default, `/en`). Deploy en Vercel:
**https://www.d-stellar.co** (NO `.com` — ver abajo).

**La fuente de verdad real de este proyecto es `PROJECT_NOTES.md` en esta
misma carpeta** — se mantiene actualizado y tiene más detalle que este
archivo (sistema de marca completo, arquitectura, cómo actualizar menú/
eventos/prensa/calendario). Leer eso primero para trabajo de contenido.

## Regla dura: cero datos fabricados
Nunca inventar citas de reseñas, ratings, conteos de reseñas, ni menciones de
prensa. Cada link en `data/press.ts` fue verificado manualmente (que de
verdad nombre "d-stellar"; varios artículos de roundups LGBTQ+/panaderías se
descartaron por no cumplir esto). `data/reviews.ts` muestra una card
CTA-only (link a Google Maps) en vez de testimonios falsos cuando está
vacío. Si una tarea requeriría inventar un dato, usar `AskUserQuestion` y
pedir que Carlos pegue el contenido real — es el patrón que él prefiere.

## Dominio — ojo con esto
El dominio real y en producción es **`https://www.d-stellar.co`**, NO
`.com`. `d-stellar.com` es una tienda WordPress/WooCommerce **vieja pero
todavía viva** en Hostinger (no decomisionada) — no confundir ni enlazar ahí.
`data/site.ts` → `SITE_URL` debe apuntar siempre a `.co`.

## Supabase — regla de aislamiento
Este proyecto tiene su propio proyecto Supabase dedicado (`d-stellar`, org
StoutLab, `jhycktyloblpytwmtfmc.supabase.co`). **Nunca reutilizar** el de
`stoutlab-outreach` ni el de `ruzafa-bike-rent` — un Supabase por cliente,
sin excepción (ya se rompió esta regla una vez por accidente).

## Sub-proyectos en este repo
- `/analytics` — dashboard de analítica social (IG+FB+TikTok) en
  construcción por fases, protegido con contraseña compartida
  (`dstellar-cookies-26`). Ver memoria `project_dstellar_analytics_dashboard`
  para el estado detallado por fase.
- Motor de prospección B2B para "Private Session" (alquiler de local):
  `app/api/cron/prospect-events`, `lib/prospecting/*`,
  `lib/ai/private-event-*` — mismo patrón draft-then-human-approve que
  `stoutlab-outreach`, gate de confianza 85. Nada se envía automático.

## Notas técnicas recurrentes
- Botón "Preferred Sources" de Google en el footer — método manual control,
  `next/script` lazyOnload, NO el widget auto-renderizado (para que combine
  con el estilo del sitio).
- GA4: eventos `click_whatsapp` y `click_phone` ya están wireados.
