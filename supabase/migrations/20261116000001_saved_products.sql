-- Produits sauvegardés (cœur) : mis en avant sur la page d'essayage.
-- Écriture non sensible (aucun crédit en jeu) : RLS limitée à ses propres lignes.

create table public.saved_products (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index saved_products_user_created_idx on public.saved_products (user_id, created_at desc);

alter table public.saved_products enable row level security;

create policy "saved_products: own all" on public.saved_products
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
