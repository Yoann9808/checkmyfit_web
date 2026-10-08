-- =====================================================================
-- Essayages bloqués : horodatage du début de traitement + fail_tryon durci
-- =====================================================================

-- Début du traitement (passage en `processing`) : permet de détecter un
-- essayage dont la tâche de fond a été interrompue (fonction serverless coupée).
alter table public.tryons add column started_at timestamptz;

-- fail_tryon ne touche plus qu'un essayage en cours : un rendu déjà réussi
-- ne peut plus être basculé en échec (et remboursé) par un appel tardif.
create or replace function public.fail_tryon(p_tryon_id uuid, p_error text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_row public.tryons;
begin
  select * into v_row from public.tryons where id = p_tryon_id for update;
  if not found or v_row.status not in ('queued', 'processing') then return; end if;

  update public.tryons set status = 'failed', error = p_error, completed_at = now()
   where id = p_tryon_id;

  insert into public.credit_transactions (user_id, delta, reason, ref_id)
  values (v_row.user_id, 1, 'refund', v_row.id::text || ':' || v_row.attempt)
  on conflict do nothing;
end $$;

revoke all on function public.fail_tryon(uuid, text) from public, anon, authenticated;
