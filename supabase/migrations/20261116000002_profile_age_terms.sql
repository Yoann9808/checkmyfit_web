-- Âge minimum (15 ans) et acceptation des CGU/CGV, horodatés sur le profil.
-- Inscription e-mail : transmis via les métadonnées d'inscription (options.data).
-- Connexion Google : confirmés à l'étape photo (setReferencePhotoAction).

alter table public.profiles
  add column age_confirmed_at timestamptz,
  add column terms_accepted_at timestamptz;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_confirmed boolean := coalesce((new.raw_user_meta_data ->> 'age_and_terms_confirmed')::boolean, false);
begin
  insert into public.profiles (id, email, age_confirmed_at, terms_accepted_at)
  values (
    new.id,
    new.email,
    case when v_confirmed then now() end,
    case when v_confirmed then now() end
  );
  insert into public.credit_transactions (user_id, delta, reason, ref_id)
  values (new.id, 20, 'signup_bonus', new.id::text);
  return new;
end $$;

-- Auto-déclaration : l'utilisateur peut horodater lui-même sa confirmation
grant update (age_confirmed_at, terms_accepted_at) on public.profiles to authenticated;
