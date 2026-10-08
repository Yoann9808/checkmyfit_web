import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Redirection affiliée : enregistre le clic puis redirige vers le marchand.
 * GET /api/go/<productId>
 */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/go/[productId]">) {
  const { productId } = await ctx.params;
  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("id, affiliate_url, is_active")
    .eq("id", productId)
    .maybeSingle();

  if (!product || !product.is_active) {
    return NextResponse.redirect(new URL("/catalogue", _req.url));
  }

  const session = await getSessionUser();
  await admin.from("affiliate_clicks").insert({
    product_id: product.id,
    user_id: session?.id ?? null,
    referrer: _req.headers.get("referer"),
  });

  return NextResponse.redirect(product.affiliate_url, { status: 302 });
}
