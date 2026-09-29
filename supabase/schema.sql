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
