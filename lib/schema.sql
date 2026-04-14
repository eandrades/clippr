-- ============================================================
-- CLIPPR — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Peluquerías (barbershops)
create table if not exists barbershops (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,
  address      text,
  city         text,
  phone        text,
  email        text,
  plan         text not null default 'free' check (plan in ('free','pro','business')),
  active       boolean not null default true,
  owner_id     uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

-- 2. Barbers (staff of a barbershop)
create table if not exists barbers (
  id             uuid primary key default gen_random_uuid(),
  barbershop_id  uuid references barbershops(id) on delete cascade,
  name           text not null,
  color          text default '#1a8c65',
  active         boolean default true,
  created_at     timestamptz default now()
);

-- 3. Services offered by each barbershop
create table if not exists services (
  id             uuid primary key default gen_random_uuid(),
  barbershop_id  uuid references barbershops(id) on delete cascade,
  name           text not null,
  duration_min   int not null default 30,
  price          numeric(10,2),
  active         boolean default true
);

-- 4. Clients
create table if not exists clients (
  id             uuid primary key default gen_random_uuid(),
  barbershop_id  uuid references barbershops(id) on delete cascade,
  name           text not null,
  phone          text,
  email          text,
  notes          text,
  created_at     timestamptz default now()
);

-- 5. Reservations / appointments
create table if not exists reservations (
  id             uuid primary key default gen_random_uuid(),
  barbershop_id  uuid references barbershops(id) on delete cascade,
  client_id      uuid references clients(id),
  barber_id      uuid references barbers(id),
  service_id     uuid references services(id),
  date           date not null,
  time           time not null,
  status         text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  notes          text,
  created_at     timestamptz default now()
);

-- 6. Landing contact / waitlist leads
create table if not exists leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  barbershop   text,
  city         text,
  message      text,
  created_at   timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table barbershops  enable row level security;
alter table barbers       enable row level security;
alter table services      enable row level security;
alter table clients       enable row level security;
alter table reservations  enable row level security;
alter table leads         enable row level security;

-- Admins can only see their own barbershop data
create policy "owner_barbershop" on barbershops
  for all using (owner_id = auth.uid());

create policy "owner_barbers" on barbers
  for all using (
    barbershop_id in (select id from barbershops where owner_id = auth.uid())
  );

create policy "owner_services" on services
  for all using (
    barbershop_id in (select id from barbershops where owner_id = auth.uid())
  );

create policy "owner_clients" on clients
  for all using (
    barbershop_id in (select id from barbershops where owner_id = auth.uid())
  );

create policy "owner_reservations" on reservations
  for all using (
    barbershop_id in (select id from barbershops where owner_id = auth.uid())
  );

-- Leads: anyone can insert, only service_role can read
create policy "leads_insert" on leads for insert with check (true);

-- ============================================================
-- Seed data for demo (optional)
-- ============================================================
insert into barbershops (name, slug, address, city, phone, plan) values
  ('Barbería El Filo', 'el-filo', 'Av. Providencia 1234', 'Santiago', '+56912345678', 'pro'),
  ('Classic Cuts', 'classic-cuts', 'Gran Avenida 567', 'Santiago', '+56987654321', 'free')
on conflict do nothing;
