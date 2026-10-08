import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy Next.js (ex-middleware) : rafraîchit la session Supabase à chaque
 * requête et protège les zones privées.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Ne pas supprimer : getUser() rafraîchit le jeton si nécessaire.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/compte") ||
    pathname.startsWith("/dressing") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/onboarding");

  if (!user && isProtected) {
    const login = request.nextUrl.clone();
    login.pathname = "/connexion";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    // Tout sauf les assets statiques et les images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
