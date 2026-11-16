-- Attributs produits pour les filtres du catalogue : matière, motif, prix barré.
-- « En solde » est dérivé du prix barré (colonne générée, filtrable côté API).

alter table public.products
  add column material text,
  add column pattern text,
  add column compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  add column is_on_sale boolean generated always as (compare_at_price is not null and compare_at_price > price) stored;

create index products_active_category_idx on public.products (category) where is_active;
create index products_sizes_idx on public.products using gin (sizes);
