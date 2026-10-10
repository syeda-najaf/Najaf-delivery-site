-- NAJAF NOVA live rider GPS migration
-- Run in Supabase Dashboard > SQL Editor.
-- Location publishing is done through a narrowly scoped RPC, not broad table UPDATE rights.

alter table public.orders
  add column if not exists rider_id uuid references auth.users(id) on delete set null,
  add column if not exists rider_lat double precision,
  add column if not exists rider_lng double precision,
  add column if not exists rider_location_updated_at timestamptz,
  add column if not exists customer_lat double precision,
  add column if not exists customer_lng double precision;

alter table public.orders enable row level security;

drop policy if exists "Assigned riders can read their orders" on public.orders;
create policy "Assigned riders can read their orders"
on public.orders
for select
to authenticated
using (auth.uid() = rider_id);

create or replace function public.update_rider_location(
  p_order_id uuid,
  p_lat double precision,
  p_lng double precision
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in before sharing rider location';
  end if;

  if p_lat is null or p_lng is null
     or p_lat < -90 or p_lat > 90
     or p_lng < -180 or p_lng > 180 then
    raise exception 'Invalid GPS coordinates';
  end if;

  update public.orders
  set rider_lat = p_lat,
      rider_lng = p_lng,
      rider_location_updated_at = now()
  where id = p_order_id
    and rider_id = auth.uid();

  if not found then
    raise exception 'This account is not assigned to that order';
  end if;
end;
$$;

revoke all on function public.update_rider_location(uuid, double precision, double precision) from public;
grant execute on function public.update_rider_location(uuid, double precision, double precision) to authenticated;

-- Enable Postgres Changes so customer tracking pages receive updates.
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'supabase_realtime publication not found. Enable orders in Database > Publications > supabase_realtime.';
end $$;
