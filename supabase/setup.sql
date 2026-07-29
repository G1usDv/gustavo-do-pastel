-- Execute este arquivo inteiro no SQL Editor do Supabase uma única vez.
-- Depois de criar a conta da administradora em Authentication > Users,
-- execute também o último comando deste arquivo, preenchendo o e-mail dela.

create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  description text not null default '',
  badge text,
  custom_config jsonb,
  image_url text,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_catalog_index on public.products (available, category, sort_order);

create or replace function public.is_store_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(select 1 from public.store_admins where user_id = auth.uid());
$$;

grant execute on function public.is_store_admin() to anon, authenticated;

alter table public.store_admins enable row level security;
alter table public.products enable row level security;

drop policy if exists "Public can view available products" on public.products;
drop policy if exists "Store admins manage products" on public.products;
create policy "Public can view available products"
on public.products for select to anon, authenticated
using (available = true);
create policy "Store admins manage products"
on public.products for all to authenticated
using (public.is_store_admin())
with check (public.is_store_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 8388608, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Store admins manage product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select to public
using (bucket_id = 'product-images');
create policy "Store admins manage product images"
on storage.objects for all to authenticated
using (bucket_id = 'product-images' and public.is_store_admin())
with check (bucket_id = 'product-images' and public.is_store_admin());

-- Faça isto somente DEPOIS de criar a usuária da sua mãe em Authentication > Users.
-- Troque o e-mail abaixo pelo e-mail usado no login dela e execute esta linha separadamente.
-- insert into public.store_admins (user_id)
-- select id from auth.users where email = 'EMAIL-DA-SUA-MAE@EXEMPLO.COM';
