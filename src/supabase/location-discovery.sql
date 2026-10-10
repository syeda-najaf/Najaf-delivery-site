-- NAJAF NOVA: location-aware registered restaurants and menus.
-- Run in Supabase SQL Editor. Back up your project before applying.
create extension if not exists pgcrypto;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text,
  cuisine text,
  image_url text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  rating numeric(2,1),
  is_open boolean not null default true,
  is_active boolean not null default true,
  delivery_radius_km numeric(5,2) not null default 5 check (delivery_radius_km > 0 and delivery_radius_km <= 100),
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  category text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists restaurants_active_geo_idx on public.restaurants (is_active, latitude, longitude);
create index if not exists restaurant_menu_items_restaurant_idx on public.restaurant_menu_items (restaurant_id, is_available);

alter table public.restaurants enable row level security;
alter table public.restaurant_menu_items enable row level security;

drop policy if exists "Public can read active restaurants" on public.restaurants;
create policy "Public can read active restaurants" on public.restaurants for select to anon, authenticated using (is_active = true);

drop policy if exists "Public can read available menus of active restaurants" on public.restaurant_menu_items;
create policy "Public can read available menus of active restaurants" on public.restaurant_menu_items for select to anon, authenticated using (is_available = true and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.is_active = true));

grant select on public.restaurants, public.restaurant_menu_items to anon, authenticated;

-- Orders: keep readable address plus separate GPS coordinates.
alter table public.orders add column if not exists customer_lat double precision;
alter table public.orders add column if not exists customer_lng double precision;
alter table public.orders add column if not exists customer_location_accuracy_m double precision;

-- Optional sample partner kitchen. Replace its location and menu with a real registered kitchen.
-- Do not leave this sample active in production.
-- insert into public.restaurants (name,cuisine,latitude,longitude,is_active)
-- values ('NAJAF Demo Kitchen','Indian · Wraps · Bowls',12.9716,77.5946,false);
