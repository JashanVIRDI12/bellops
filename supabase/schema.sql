-- Bellops: the tables behind the contact form and the admin portal.
--
-- Run this once: Supabase dashboard → SQL Editor → New query → paste → Run.
-- It is safe to run again; it only adds what's missing.
--
-- Only the website's server can read or change these tables. It uses the
-- project's secret key, which bypasses row level security. The public
-- (publishable / anon) key gets no access at all.

-- ── Enquiries ───────────────────────────────────────────────────────────────

create table if not exists public.leads (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'won', 'lost')),
  name text not null check (char_length(name) between 1 and 100),
  email text not null default '' check (char_length(email) <= 200),
  phone text not null default '' check (char_length(phone) <= 30),
  services text[] not null default '{}',
  budget text not null default '' check (char_length(budget) <= 100),
  message text not null check (char_length(message) <= 4000)
);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
grant select, insert, update, delete on table public.leads to service_role;

-- ── Rate limits ─────────────────────────────────────────────────────────────
-- Counts sign-in attempts and enquiries per visitor, to slow down spam and
-- password guessing. Visitors are a one-way hash of their IP, never the IP.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null,
  reset_at timestamptz not null
);

create index if not exists rate_limits_reset_at_idx
  on public.rate_limits (reset_at);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.rate_limits to service_role;

-- Adds one attempt and returns how many this visitor made in the window.
create or replace function public.count_attempt(
  attempt_key text,
  window_seconds integer
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  attempts integer;
begin
  -- Now and then, clear out windows that ended more than a day ago.
  if random() < 0.02 then
    delete from public.rate_limits where reset_at < now() - interval '1 day';
  end if;

  insert into public.rate_limits as limits (key, count, reset_at)
  values (attempt_key, 1, now() + make_interval(secs => window_seconds))
  on conflict (key) do update set
    count = case when limits.reset_at < now() then 1 else limits.count + 1 end,
    reset_at = case
      when limits.reset_at < now()
        then now() + make_interval(secs => window_seconds)
      else limits.reset_at
    end
  returning count into attempts;

  return attempts;
end;
$$;

revoke execute on function public.count_attempt(text, integer)
  from public, anon, authenticated;
grant execute on function public.count_attempt(text, integer) to service_role;

-- ── Enquiry attribution ─────────────────────────────────────────────────────
-- Where each enquiry came from: the visit's channel or ad campaign, a coarse
-- city from the IP (never the IP itself), and the kind of device.

alter table public.leads
  add column if not exists source text not null default ''
    check (char_length(source) <= 60),
  add column if not exists campaign text not null default ''
    check (char_length(campaign) <= 100),
  add column if not exists city text not null default ''
    check (char_length(city) <= 100),
  add column if not exists device text not null default ''
    check (char_length(device) <= 60),
  add column if not exists session_id text not null default ''
    check (char_length(session_id) <= 40);

-- ── Analytics ───────────────────────────────────────────────────────────────
-- One row per thing that happened on a visit. No cookies, no IP addresses:
-- visitor_id is a one-way hash that changes every day, so it can count
-- visitors but never follow or identify anyone.

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null check (char_length(session_id) between 8 and 40),
  visitor_id text not null check (char_length(visitor_id) <= 40),
  type text not null
    check (type in ('pageview', 'section', 'action', 'vitals', 'engagement')),
  name text not null default '' check (char_length(name) <= 60),
  value double precision,
  path text not null default '/' check (char_length(path) <= 200),
  referrer text not null default '' check (char_length(referrer) <= 200),
  source text not null default '' check (char_length(source) <= 60),
  medium text not null default '' check (char_length(medium) <= 60),
  campaign text not null default '' check (char_length(campaign) <= 100),
  country text not null default '' check (char_length(country) <= 2),
  region text not null default '' check (char_length(region) <= 80),
  city text not null default '' check (char_length(city) <= 80),
  device text not null default '' check (char_length(device) <= 12),
  browser text not null default '' check (char_length(browser) <= 30),
  os text not null default '' check (char_length(os) <= 30),
  screen text not null default '' check (char_length(screen) <= 12),
  language text not null default '' check (char_length(language) <= 16),
  scene text not null default '' check (char_length(scene) <= 12)
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);
create index if not exists analytics_events_session_idx
  on public.analytics_events (session_id);

alter table public.analytics_events enable row level security;
revoke all on table public.analytics_events from anon, authenticated;
grant select, insert, update, delete on table public.analytics_events to service_role;

-- Everything the admin's Analytics page shows, in one call.
create or replace function public.analytics_summary(
  since timestamptz,
  until timestamptz,
  zone text default 'Asia/Kolkata'
)
returns jsonb
language sql
stable
set search_path = ''
as $$
with ev as (
  select * from public.analytics_events
  where created_at >= since and created_at < until
),
sessions as (
  select
    session_id,
    min(created_at) as started_at,
    (array_agg(visitor_id order by created_at))[1] as visitor_id,
    (array_agg(source order by created_at))[1] as source,
    (array_agg(campaign order by created_at))[1] as campaign,
    (array_agg(referrer order by created_at))[1] as referrer,
    (array_agg(country order by created_at))[1] as country,
    (array_agg(city order by created_at))[1] as city,
    (array_agg(device order by created_at))[1] as device,
    (array_agg(browser order by created_at))[1] as browser,
    (array_agg(os order by created_at))[1] as os,
    (array_agg(scene order by created_at))[1] as scene,
    count(*) filter (where type = 'pageview') as pageviews,
    coalesce(max(value) filter (where type = 'engagement'), 0) as engaged,
    count(*) filter (where type = 'section') as sections,
    count(*) filter (where type = 'action' and name like 'whatsapp%') as whatsapp,
    count(*) filter (where type = 'action' and name like 'call%') as calls,
    count(*) filter (where type = 'action' and name like 'email%') as emails,
    count(*) filter (where type = 'action' and name = 'enquiry-sent') as enquiries,
    count(*) filter (where type = 'action') as actions,
    coalesce(
      array_agg(distinct name) filter (where type = 'action'),
      '{}'
    ) as action_names,
    -- Section events carry their place in the tour as their value.
    (array_agg(name order by value desc nulls last) filter (where type = 'section'))[1]
      as furthest
  from ev
  group by session_id
),
scored as (
  select *,
    (whatsapp + calls + emails + enquiries) > 0 as contacted,
    (engaged >= 10 or sections > 1 or actions > 0) as is_engaged
  from sessions
),
days as (
  select to_char(day, 'YYYY-MM-DD') as day
  from generate_series(
    date_trunc('day', since at time zone zone),
    date_trunc('day', (until - interval '1 second') at time zone zone),
    interval '1 day'
  ) as day
)
select jsonb_build_object(
  'totals', (
    select jsonb_build_object(
      'visitors', count(distinct visitor_id),
      'sessions', count(*),
      'pageviews', coalesce(sum(pageviews), 0),
      'engagedSeconds', coalesce(avg(engaged) filter (where engaged > 0), 0),
      'engagedSessions', count(*) filter (where is_engaged),
      'contactSessions', count(*) filter (where contacted),
      'whatsapp', coalesce(sum(whatsapp), 0),
      'calls', coalesce(sum(calls), 0),
      'emails', coalesce(sum(emails), 0),
      'enquiries', coalesce(sum(enquiries), 0)
    )
    from scored
  ),
  'daily', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day', days.day,
      'visitors', coalesce(d.visitors, 0),
      'sessions', coalesce(d.sessions, 0),
      'contacts', coalesce(d.contacts, 0)
    ) order by days.day), '[]'::jsonb)
    from days
    left join (
      select
        to_char(started_at at time zone zone, 'YYYY-MM-DD') as day,
        count(distinct visitor_id) as visitors,
        count(*) as sessions,
        count(*) filter (where contacted) as contacts
      from scored
      group by 1
    ) d on d.day = days.day
  ),
  'sources', (
    select coalesce(jsonb_agg(r order by r.sessions desc), '[]'::jsonb) from (
      select coalesce(nullif(source, ''), 'Direct') as label,
        count(*) as sessions, count(*) filter (where contacted) as contacts
      from scored group by 1 order by 2 desc limit 12
    ) r
  ),
  'campaigns', (
    select coalesce(jsonb_agg(r order by r.sessions desc), '[]'::jsonb) from (
      select campaign as label,
        count(*) as sessions, count(*) filter (where contacted) as contacts
      from scored where campaign <> '' group by 1 order by 2 desc limit 12
    ) r
  ),
  'referrers', (
    select coalesce(jsonb_agg(r order by r.sessions desc), '[]'::jsonb) from (
      select referrer as label, count(*) as sessions,
        count(*) filter (where contacted) as contacts
      from scored where referrer <> '' group by 1 order by 2 desc limit 12
    ) r
  ),
  'cities', (
    select coalesce(jsonb_agg(r order by r.sessions desc), '[]'::jsonb) from (
      select
        case when city <> '' then city || ', ' || country
          when country <> '' then country else 'Unknown' end as label,
        count(*) as sessions, count(*) filter (where contacted) as contacts
      from scored group by 1 order by 2 desc limit 12
    ) r
  ),
  'devices', (
    select coalesce(jsonb_agg(r order by r.sessions desc), '[]'::jsonb) from (
      select coalesce(nullif(device, ''), 'Unknown') as label,
        count(*) as sessions, count(*) filter (where contacted) as contacts
      from scored group by 1 order by 2 desc
    ) r
  ),
  'browsers', (
    select coalesce(jsonb_agg(r order by r.sessions desc), '[]'::jsonb) from (
      select coalesce(nullif(browser || ' on ' || os, ' on '), 'Unknown') as label,
        count(*) as sessions, count(*) filter (where contacted) as contacts
      from scored group by 1 order by 2 desc limit 8
    ) r
  ),
  'sections', (
    select coalesce(jsonb_agg(jsonb_build_object('name', name, 'sessions', n)), '[]'::jsonb)
    from (
      select name, count(distinct session_id) as n
      from ev where type = 'section' group by name
    ) s
  ),
  'actions', (
    select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', n) order by n desc), '[]'::jsonb)
    from (
      select name, count(*) as n from ev where type = 'action' group by name
    ) a
  ),
  'vitals', (
    select coalesce(jsonb_object_agg(name, jsonb_build_object('p75', p75, 'samples', n)), '{}'::jsonb)
    from (
      select name,
        percentile_cont(0.75) within group (order by value) as p75,
        count(*) as n
      from ev where type = 'vitals' and value is not null group by name
    ) v
  ),
  'scenes', (
    select coalesce(jsonb_agg(r order by r.sessions desc), '[]'::jsonb) from (
      select coalesce(nullif(scene, ''), 'Unknown') as label, count(*) as sessions
      from scored group by 1
    ) r
  ),
  'recent', (
    select coalesce(jsonb_agg(r order by r.started_at desc), '[]'::jsonb) from (
      select started_at, source, campaign, referrer, city, country, device,
        browser, os, engaged, pageviews, furthest, action_names as actions
      from scored order by started_at desc limit 30
    ) r
  ),
  'live', (
    select count(distinct session_id) from public.analytics_events
    where created_at > now() - interval '5 minutes'
  )
);
$$;

revoke execute on function public.analytics_summary(timestamptz, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.analytics_summary(timestamptz, timestamptz, text)
  to service_role;

-- Make the new tables visible to the API straight away.
notify pgrst, 'reload schema';
