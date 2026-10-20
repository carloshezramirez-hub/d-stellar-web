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
- `/admin` — panel único de staff (desde 2026-10-19): un solo login
  (`ANALYTICS_DASHBOARD_PASSWORD`, cookie `admin_session` con `path: "/"`)
  que autoriza también `/analytics`, `/pedidos` y `/wallet-staff` sin volver
  a pedir contraseña — ver `lib/admin-auth.ts`. El hub (`/admin`) tiene 6
  botones: Ventas, Analytics, Anuncios, Eventos, Pedidos, Fidelidad.
- `/admin/ventas` (2026-10-20) — ventas reales de piso, jaladas en vivo del
  ERP **Odoo** de Carlos (`the-sweet-universe-company.odoo.com`, módulo
  Punto de Venta) vía su External API (JSON-RPC, no REST — Odoo no tiene
  REST nativo). Cliente en `lib/odoo/client.ts` (autentica con un **API
  key**, no la contraseña real, generado desde Odoo → Mi perfil →
  Seguridad → Claves API, alcance "RPC", sin expiración). Lógica de
  negocio en `lib/odoo/sales.ts` (`fetchSalesSummary`, `fetchTopProducts`)
  — lee `pos.order` / `pos.order.line`, agrupa por día en zona horaria
  `America/Mexico_City` (Odoo guarda `date_order` en UTC naive). Variables
  en Vercel: `ODOO_URL`, `ODOO_DB`, `ODOO_USERNAME`, `ODOO_API_KEY`. Odoo
  también tiene Compras/Inventario/Manufactura/Contabilidad, pero **sin
  datos reales todavía** (confirmado vía API: 0 facturas de proveedor,
  purchase.order solo con registros de prueba/cancelados) — por eso el
  panel no muestra "egresos operativos", solo ventas. `fetchWeekdayPattern`
  agrega el patrón por día de la semana (qué día vende más/menos).
- `/admin/trafico` (2026-10-20) — Google Analytics (GA4 Data API) +
  Search Console (Search Analytics API), en vivo. Cliente propio en
  `lib/google/client.ts` — JWT Bearer flow con cuenta de servicio
  (`panel-dstellar@d-stellar-panel.iam.gserviceaccount.com`, proyecto GCP
  `d-stellar-panel`), sin SDK de Google, solo `crypto` nativo de Node.
  Variables en Vercel: `GOOGLE_SERVICE_ACCOUNT_JSON` (el JSON completo de
  la cuenta de servicio, como un solo string), `GA4_PROPERTY_ID`
  (`549524452`), `GSC_SITE_URL` (`sc-domain:d-stellar.co`). La cuenta de
  servicio tiene rol **Lector/Viewer** en GA4 (Property access management)
  y **Restringido** en Search Console (Users and permissions) — nunca
  escritura. Lógica en `lib/google/analytics.ts`
  (`fetchTrafficSummary`: sesiones por día, canal, páginas más vistas) y
  `lib/google/search-console.ts` (`fetchSearchSummary`: qué busca la
  gente, con qué CTR/posición).
- `/admin/ideas` (2026-10-20) — "Ideas para vender más": reglas
  determinísticas (NO LLM, mismo patrón que `lib/ads/analysis.ts`) que
  cruzan Ventas (Odoo) + Anuncios + Eventos + Fidelidad + Pedidos + mejor
  post orgánico + Search Console, en `lib/insights/sales-ideas.ts`
  (`buildSalesIdeas`). Cada idea cita un número real; si una fuente no
  tiene datos suficientes, esa idea simplemente no aparece (nunca se
  rellena con texto inventado).
- **Sistema visual "centro de mando" (desde 2026-10-20):** todas las páginas
  de `/admin` + `/analytics` + `/pedidos` + `/wallet-staff` comparten
  `components/admin/console-shell.tsx` (barra superior fija: wordmark,
  pills de navegación entre secciones, indicador "en vivo", Salir — un solo
  componente, no headers ad hoc por página) y
  `components/admin/kpi-tile.tsx` (tile de estadística reusable, con acento
  de color por sección). El objetivo pedido por Carlos: que se sienta como
  un panel de control real — gráficas primero, navegación libre entre
  secciones sin depender del botón atrás. Al agregar una sección nueva:
  reusar `ConsoleShell` + `KpiTile`, no crear un header propio.
- `/analytics` — dashboard de analítica social orgánica (IG+FB+TikTok) en
  construcción por fases. Ver memoria `project_dstellar_analytics_dashboard`
  para el estado detallado por fase.
- `/admin/anuncios` — dashboard de campañas pagadas de TikTok Ads
  (@dstellarmx), separado de `/analytics` porque es orgánico vs. pagado.
  Datos 100% reales pegados a mano desde TikTok Ads Manager en
  `data/ads-campaigns.ts` (sin API conectada, sin cron) — análisis
  determinístico (no LLM) en `lib/ads/analysis.ts` compara campañas entre sí
  (targeting, duración de video, tono de copy, costo por like/clic) y genera
  los "aprendizajes" que se ven en la página. Para agregar campañas nuevas:
  pegar los números reales en `data/ads-campaigns.ts` siguiendo el mismo
  patrón, nunca estimar cifras.
- Motor de prospección B2B para "Private Session" (alquiler de local):
  `app/api/cron/prospect-events`, `lib/prospecting/*`,
  `lib/ai/private-event-*` — mismo patrón draft-then-human-approve que
  `stoutlab-outreach`, gate de confianza 85. Nada se envía automático.
- `/fidelidad` — tarjeta de fidelidad en Apple Wallet (beta): geofence
  nativo de iOS + actualización en vivo vía push de Apple (staff escanea en
  `/wallet-staff` y suma sellos, la tarjeta ya instalada se refresca sola).
  Regla confirmada: 10 sellos = 1 sorpresa. `/wallet-staff/clientes` lista
  toda la base de clientes (nombre/teléfono/email/nivel/sellos) con CSV —
  el email es obligatorio en el signup. Ver `lib/wallet/*`,
  `app/api/wallet/*`, `app/api/wallet-staff/*`, y **`WALLET_SETUP.md`**.
- `/admin/eventos` — CRUD completo de eventos (crear/editar/borrar,
  sesiones múltiples con toggle "agotada", niveles de boleto, subida de
  imágenes a Supabase Storage) + panel de ventas por evento (quién pagó,
  boletos vendidos, ingreso total). Los eventos viven en la tabla `events`
  de Supabase (antes hardcodeados en `data/events.ts`, que ya no existe) —
  ver `lib/events-db.ts`, `lib/events-types.ts`,
  `components/admin/event-form.tsx`. Cualquier cambio revalida
  `/events` y `/events/[slug]` al instante (sin redeploy).

## Notas técnicas recurrentes
- Botón "Preferred Sources" de Google en el footer — método manual control,
  `next/script` lazyOnload, NO el widget auto-renderizado (para que combine
  con el estilo del sitio).
- GA4: eventos `click_whatsapp` y `click_phone` ya están wireados.
