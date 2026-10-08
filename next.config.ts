import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Aligné sur la limite de requête des fonctions Vercel (4,5 Mo)
  experimental: { serverActions: { bodySizeLimit: "4.5mb" } },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      ...(supabaseHost && supabaseHost !== "localhost" && supabaseHost !== "127.0.0.1"
        ? [{ protocol: "https" as const, hostname: supabaseHost }]
        : [
            { protocol: "http" as const, hostname: "127.0.0.1" },
            { protocol: "http" as const, hostname: "localhost" },
          ]),
    ],
  },
};

export default nextConfig;
