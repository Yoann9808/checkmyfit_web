-- =====================================================================
-- Checkmyfit — schéma initial
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');
create type public.credit_reason as enum ('signup_bonus', 'tryon', 'refund', 'purchase', 'admin_adjustment');
create type public.tryon_status as enum ('queued', 'processing', 'succeeded', 'failed');
create type public.wardrobe_kind as enum ('tryon', 'owned');
create type public.product_gender as enum ('Femme', 'Homme', 'Unisexe');

-- ---------------------------------------------------------------------
-- updated_at automatique
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role public.user_role not null default 'user',
  reference_photo_path text,
  photo_consent_at timestamptz,
  credits_balance integer not null default 0 check (credits_balance >= 0),
  onboarding_seen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- credit_transactions (ledger : source de vérité du solde)
-- ---------------------------------------------------------------------
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason public.credit_reason not null,
  ref_id text,
  created_at timestamptz not null default now()
);
create index credit_transactions_user_idx on public.credit_transactions (user_id, created_at desc);
-- Idempotence : une seule écriture par (motif, référence)
create unique index credit_transactions_ref_idx on public.credit_transactions (reason, ref_id)
  where ref_id is not null;

create or replace function public.apply_credit_transaction()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set credits_balance = credits_balance + new.delta
   where id = new.user_id;
  return new;
end $$;
create trigger credit_transactions_apply after insert on public.credit_transactions
  for each row execute function public.apply_credit_transaction();

-- ---------------------------------------------------------------------
-- Nouvel utilisateur : profil + bonus d'inscription
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.credit_transactions (user_id, delta, reason, ref_id)
  values (new.id, 20, 'signup_bonus', new.id::text);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  slug text not null unique,
  name text not null,
  brand text not null,
  category text not null,
  gender public.product_gender not null default 'Unisexe',
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'EUR',
  color text,
  description text,
  care text,
  made_in text,
  size_advice text,
  sizes text[] not null default '{}',
  image_path text,
  image_source_url text,
  merchant text not null,
  affiliate_url text not null,
  is_popular boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_active_idx on public.products (is_active, created_at desc);
create index products_category_idx on public.products (category);
create index products_brand_idx on public.products (brand);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- catalog_imports
-- ---------------------------------------------------------------------
create table public.catalog_imports (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  filename text not null,
  rows_total integer not null default 0,
  rows_ok integer not null default 0,
  rows_error integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- tryons (un rendu par couple user / produit)
-- ---------------------------------------------------------------------
create table public.tryons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  status public.tryon_status not null default 'queued',
  attempt integer not null default 1,
  provider text,
  result_path text,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, product_id)
);
create index tryons_user_idx on public.tryons (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- wardrobe_items
-- ---------------------------------------------------------------------
create table public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.wardrobe_kind not null,
  tryon_id uuid references public.tryons (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  brand text,
  category text not null,
  color text,
  photo_path text,
  created_at timestamptz not null default now(),
  check (
    (kind = 'tryon' and tryon_id is not null) or
    (kind = 'owned' and photo_path is not null)
  )
);
create index wardrobe_items_user_idx on public.wardrobe_items (user_id, created_at desc);
create unique index wardrobe_items_tryon_idx on public.wardrobe_items (user_id, tryon_id)
  where tryon_id is not null;

-- ---------------------------------------------------------------------
-- affiliate_clicks
-- ---------------------------------------------------------------------
create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  product_id uuid not null references public.products (id) on delete cascade,
  referrer text,
  created_at timestamptz not null default now()
);
create index affiliate_clicks_product_idx on public.affiliate_clicks (product_id, created_at desc);

-- ---------------------------------------------------------------------
-- stripe_events (idempotence webhook)
-- ---------------------------------------------------------------------
create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- =====================================================================
-- Fonctions métier
-- =====================================================================

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Lance un essayage : débite 1 crédit de façon atomique.
-- Retourne la ligne tryons (existante si déjà générée, sans débit).
create or replace function public.start_tryon(p_product_id uuid)
returns public.tryons language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_balance integer;
  v_row public.tryons;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if not exists (select 1 from public.products where id = p_product_id and is_active) then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  -- Verrou sur le profil pour sérialiser les débits d'un même utilisateur
  select credits_balance into v_balance from public.profiles where id = v_user for update;

  select * into v_row from public.tryons where user_id = v_user and product_id = p_product_id;

  if found and v_row.status in ('succeeded', 'queued', 'processing') then
    return v_row;
  end if;

  if v_balance < 1 then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  if found then
    update public.tryons
       set status = 'queued', attempt = attempt + 1, error = null,
           result_path = null, created_at = now(), completed_at = null
     where id = v_row.id
     returning * into v_row;
  else
    insert into public.tryons (user_id, product_id) values (v_user, p_product_id)
    returning * into v_row;
  end if;

  insert into public.credit_transactions (user_id, delta, reason, ref_id)
  values (v_user, -1, 'tryon', v_row.id::text || ':' || v_row.attempt);

  return v_row;
end $$;

-- Marque un essayage en échec et rembourse le crédit (appel serveur uniquement).
create or replace function public.fail_tryon(p_tryon_id uuid, p_error text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_row public.tryons;
begin
  select * into v_row from public.tryons where id = p_tryon_id for update;
  if not found or v_row.status = 'failed' then return; end if;

  update public.tryons set status = 'failed', error = p_error, completed_at = now()
   where id = p_tryon_id;

  insert into public.credit_transactions (user_id, delta, reason, ref_id)
  values (v_row.user_id, 1, 'refund', v_row.id::text || ':' || v_row.attempt)
  on conflict do nothing;
end $$;

revoke all on function public.fail_tryon(uuid, text) from public, anon, authenticated;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.products enable row level security;
alter table public.catalog_imports enable row level security;
alter table public.tryons enable row level security;
alter table public.wardrobe_items enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.stripe_events enable row level security;

-- profiles : lecture / mise à jour de son propre profil, colonnes restreintes
create policy "profiles: own read" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: own update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (reference_photo_path, photo_consent_at, onboarding_seen) on public.profiles to authenticated;

-- credit_transactions : lecture seule de son historique
create policy "credits: own read" on public.credit_transactions
  for select to authenticated using (user_id = auth.uid());

-- products : lecture publique des produits actifs, tout pour l'admin
create policy "products: public read" on public.products
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "products: admin write" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- catalog_imports : admin
create policy "imports: admin" on public.catalog_imports
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- tryons : lecture de ses essayages (écriture via fonctions / service role)
create policy "tryons: own read" on public.tryons
  for select to authenticated using (user_id = auth.uid());

-- wardrobe_items : CRUD complet sur son dressing
create policy "wardrobe: own all" on public.wardrobe_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- affiliate_clicks / stripe_events : aucune politique (service role uniquement)

-- =====================================================================
-- Storage
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('reference-photos', 'reference-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('tryon-results', 'tryon-results', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('wardrobe', 'wardrobe', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

-- Fichiers privés rangés par dossier utilisateur : <uid>/<fichier>
create policy "storage: own private files" on storage.objects
  for all to authenticated
  using (
    bucket_id in ('reference-photos', 'tryon-results', 'wardrobe')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('reference-photos', 'wardrobe')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage: products public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'products');

create policy "storage: products admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());
