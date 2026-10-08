import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/utils";

/** Retour OAuth / lien e-mail : échange le code contre une session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("reference_photo_path")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile?.reference_photo_path) {
          return NextResponse.redirect(`${origin}/onboarding/photo?next=${encodeURIComponent(next)}`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=callback`);
}
