-- d-stellar "Eventos privados" outbound prospecting — leads dentro de un
-- radio caminable de Nuevo León 217. Ver PROJECT_NOTES.md / memoria del
-- proyecto para el contexto completo del motor de prospección.
create table if not exists event_leads (
  id uuid primary key default gen_random_uuid(),

  place_id text unique not null,
  business_name text not null,
  category text not null, -- término de búsqueda de Places que lo encontró (ej. "coworking")
  segment text not null check (segment in ('marca', 'corporativo', 'comunidad', 'particulares')),
  formatted_address text,
  lat numeric,
  lng numeric,
  website text,
  phone text,

  -- distancia caminable real (Distance Matrix API, mode=walking) desde
  -- BUSINESS.geo — nunca línea recta, nunca estimada
  walking_distance_m int,
  walking_duration_min int,

  rating numeric,
  review_count int,

  -- contacto extraído del propio sitio del prospecto (nunca de un tercero)
  contact_email text,
  contact_name text,

  -- plan generado por el research agent (Claude) — se persiste siempre,
  -- incluso cuando no pasa el gate de confianza
  ai_subject text,
  ai_body text,
  ai_evidence_line text,
  ai_what_we_checked jsonb,
  ai_confidence int,
  ai_gate_passed boolean,
  ai_generated_at timestamptz,

  status text not null default 'prospected' check (status in (
    'prospected', 'drafted', 'skipped_no_evidence', 'skipped_no_email',
    'approved', 'sent', 'replied', 'rejected', 'booked'
  )),

  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists event_leads_status_idx on event_leads (status);
create index if not exists event_leads_segment_idx on event_leads (segment);

-- Dashboard de analítica social (Instagram, Facebook, TikTok) — ver
-- PROJECT_NOTES.md / memoria del proyecto para el contexto completo.
create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'facebook', 'tiktok')),
  handle text not null,
  external_id text, -- IG business account id / FB page id (tiktok no lo necesita, se scrapea por handle)
  created_at timestamptz not null default now(),
  unique (platform, handle)
);

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references social_accounts (id),
  platform_post_id text not null,
  permalink text,
  caption text,
  media_type text,
  posted_at timestamptz,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  unique (account_id, platform_post_id)
);

create table if not exists social_metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references social_posts (id),
  captured_at timestamptz not null default now(),
  views bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  saves bigint,
  reach bigint,
  engagement_rate numeric,
  avg_watch_time_seconds numeric, -- IG reels y FB reels (no aplica a fotos/carruseles)
  total_watch_time_seconds numeric -- solo IG reels expone esto (ig_reels_video_view_total_time)
);

create table if not exists social_account_snapshots (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references social_accounts (id),
  captured_at timestamptz not null default now(),
  followers bigint,
  total_likes bigint, -- TikTok solo expone esto a nivel cuenta, no por video (ver lib/social/tiktok.ts)
  video_count int
);

create index if not exists social_posts_account_idx on social_posts (account_id);
create index if not exists social_metrics_snapshots_post_idx on social_metrics_snapshots (post_id);
create index if not exists social_metrics_snapshots_captured_idx on social_metrics_snapshots (captured_at);
create index if not exists social_account_snapshots_account_idx on social_account_snapshots (account_id);

-- Historial maestro de compras hechas desde la web (boletos de evento y
-- pedidos de pickup) vía Mercado Pago. Se escribe ANTES de intentar enviar
-- cualquier correo de confirmación, para que exista un registro aunque el
-- correo rebote, se vaya a spam, o falle por completo. payment_id es la
-- llave de idempotencia: un mismo pago de Mercado Pago nunca genera dos
-- filas, aunque el webhook reintente (lo hace con frecuencia).
create table if not exists web_orders (
  id uuid primary key default gen_random_uuid(),

  kind text not null check (kind in ('ticket', 'pickup')),
  code text not null,
  payment_id text not null unique,
  amount_mxn numeric not null,
  currency text not null default 'MXN',

  concept text not null, -- resumen humano: "El camino de regreso · 1x Experiencia Dúo" / "Pickup · 2 productos"
  items jsonb, -- detalle crudo: boleto (evento/ticket/qty) o pickup (lista de productos)
  event_slug text,
  session_date_iso text,

  customer_name text,
  customer_email text not null,
  customer_phone text,
  locale text not null default 'es',
  notes text,

  email_customer_status text not null default 'pending' check (email_customer_status in ('pending', 'sent', 'bounced', 'complained', 'failed')),
  email_owner_status text not null default 'pending' check (email_owner_status in ('pending', 'sent', 'bounced', 'complained', 'failed')),
  email_customer_resend_id text,
  email_owner_resend_id text,

  raw_metadata jsonb, -- metadata cruda de Mercado Pago, para debug/auditoría

  created_at timestamptz not null default now()
);

create index if not exists web_orders_kind_idx on web_orders (kind);
create index if not exists web_orders_code_idx on web_orders (code);
create index if not exists web_orders_email_customer_status_idx on web_orders (email_customer_status);
create index if not exists web_orders_created_at_idx on web_orders (created_at desc);
create index if not exists web_orders_event_slug_idx on web_orders (event_slug);

alter table web_orders enable row level security;

-- Eventos públicos (viewing parties, cenas temáticas, etc.) — antes vivían
-- hardcodeados en data/events.ts; se migraron aquí para poder editarlos
-- desde /admin/eventos sin necesitar un redeploy. event_slug en web_orders
-- y el `eventSlug`/`ticketIndex` que viajan en los metadata de Mercado Pago
-- siguen apuntando a `slug` y al índice dentro de `tickets` — nunca
-- convertir `tickets` en una tabla aparte con sus propios IDs.
create table if not exists events (
  id uuid primary key default gen_random_uuid(),

  slug text unique not null,
  title text not null,

  date_iso timestamptz,
  end_iso timestamptz,
  -- false = el día está confirmado pero no la hora exacta (ver monthLabel
  -- en EventRecord históricamente) — los formatos de fecha omiten la hora.
  time_known boolean not null default true,
  month_label jsonb, -- {es, en} — fallback cuando ni siquiera el día está confirmado (date_iso null)
  session_dates timestamptz[],
  sold_out_session_dates timestamptz[],
  dates_summary jsonb, -- {es, en} — override del formateo automático cuando hay sessionDates
  doors_note jsonb, -- {es, en}

  summary jsonb not null, -- {es, en}
  description jsonb not null, -- {es: string[], en: string[]} — un string por párrafo
  includes jsonb, -- {es: string[], en: string[]}

  capacity int,
  price_mxn numeric, -- precio único; null cuando el evento usa `tickets` (niveles)
  tickets jsonb, -- EventTicket[] — [{name:{es,en}, priceMXN, includes:{es,en}, note?:{es,en}}]

  cover_image text not null,
  gallery_images text[],
  image_alt jsonb not null, -- {es, en}

  status text not null default 'upcoming' check (status in ('upcoming', 'past')),
  external_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_status_idx on events (status);

alter table events enable row level security;

-- Tarjeta de fidelidad en Apple Wallet (beta) — pase tipo storeCard con
-- geofence (notificación en pantalla de bloqueo al pasar cerca de Nuevo
-- León 217). Ver lib/wallet/*, app/api/wallet/*, app/[locale]/fidelidad.
-- stamps/stamps_required son placeholders del beta técnico, no el
-- programa de fidelidad real todavía (pendiente de definir con Carlos).
create table if not exists loyalty_members (
  id uuid primary key default gen_random_uuid(),

  serial_number text unique not null, -- serialNumber del pase (Apple Wallet)
  auth_token text not null, -- token del webservice de actualización de pases (Authorization: ApplePass ...)

  name text not null,
  phone text not null,
  -- Obligatorio: el objetivo es poder contactar a toda la base de clientes
  -- por teléfono y correo más adelante (ver /wallet-staff/clientes).
  email text not null,
  locale text not null default 'es' check (locale in ('es', 'en')),

  stamps int not null default 0,
  stamps_required int not null default 10,
  -- Nunca se reinicia al canjear (a diferencia de `stamps`) — cuenta todos
  -- los sellos ganados en la vida del cliente, es lo que define su nivel
  -- (ver lib/wallet/tiers.ts).
  lifetime_stamps int not null default 0,

  created_at timestamptz not null default now(),
  -- Se actualiza al sumar un sello/canjear y también en bloque desde el cron
  -- diario de frases — es el "tag" que usa el protocolo de Wallet
  -- (passesUpdatedSince) para saber qué pases volver a descargar.
  updated_at timestamptz not null default now()
);

create index if not exists loyalty_members_phone_idx on loyalty_members (phone);

-- Dispositivos que registraron esta tarjeta para recibir actualizaciones
-- push (protocolo PassKit web service) — ver app/api/wallet/v1/*,
-- lib/wallet/apns.ts, lib/wallet/device-db.ts.
create table if not exists loyalty_devices (
  id uuid primary key default gen_random_uuid(),

  device_library_identifier text not null,
  loyalty_member_id uuid not null references loyalty_members (id) on delete cascade,
  push_token text not null,

  created_at timestamptz not null default now(),

  unique (device_library_identifier, loyalty_member_id)
);

create index if not exists loyalty_devices_member_idx on loyalty_devices (loyalty_member_id);

alter table loyalty_devices enable row level security;

alter table loyalty_members enable row level security;

-- Menú — antes hardcodeado en data/menu.ts, migrado para editarse desde
-- /admin/contenido sin redeploy. Ver lib/menu-db.ts.
create table if not exists menu_sections (
  slug text primary key,
  title jsonb not null, -- {es, en}
  intro jsonb not null, -- {es, en}
  accent text not null check (accent in ('green', 'pink', 'blue', 'purple', 'red')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  section_slug text not null references menu_sections (slug) on delete cascade,
  slug text not null,
  name text not null,
  description jsonb not null, -- {es, en}
  price_mxn numeric not null,
  compare_at_price_mxn numeric,
  pack_size int,
  tags text[],
  image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_slug, slug)
);

create index if not exists menu_items_section_idx on menu_items (section_slug);

alter table menu_sections enable row level security;
alter table menu_items enable row level security;

-- Prensa — antes hardcodeado en data/press.ts. Regla dura del proyecto:
-- nunca agregar una mención que no nombre "d-stellar" de verdad (ver
-- CLAUDE.md / PROJECT_NOTES.md) — el form de admin solo recuerda la regla,
-- no la valida por código.
create table if not exists press_mentions (
  id uuid primary key default gen_random_uuid(),
  outlet text not null,
  logo text,
  title text not null,
  url text not null,
  date_label jsonb not null, -- {es, en}
  summary jsonb not null, -- {es, en}
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table press_mentions enable row level security;

-- Reseñas — antes hardcodeado en data/reviews.ts. Mismo principio de cero
-- datos fabricados: solo citas reales copiadas del perfil de Google Maps.
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  rating int not null check (rating between 1 and 5),
  quote text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reviews enable row level security;

-- Fila única con el agregado real de Google Maps (promedio/conteo) — no se
-- puede derivar del set curado de `reviews` porque ese es solo una
-- selección positiva, no todas las reseñas reales.
create table if not exists review_stats (
  id int primary key default 1 check (id = 1),
  average numeric not null,
  count int not null,
  updated_at timestamptz not null default now()
);

alter table review_stats enable row level security;

-- Configuración general editable del sitio (fila única) — el resto de
-- BUSINESS en data/site.ts (dirección, geo, nombre legal, fundadores) son
-- hechos fijos y se quedan en código a propósito, ver CLAUDE.md.
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  hours jsonb not null, -- {opens, closes}
  hours_exceptions jsonb not null default '[]', -- [{dayOfWeek, opens, closes}]
  phone text not null,
  phone_href text not null,
  whatsapp_url text not null,
  email text not null,
  social jsonb not null, -- {instagram, tiktok, facebook, linkedin}
  menu_month_label jsonb not null, -- {es, en}
  seasonal_decor_enabled boolean not null default false,
  seasonal_decor_variant text,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
