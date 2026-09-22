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
