import { serverEnv } from "@/lib/env";
import { geminiProvider } from "./gemini";
import type { TryOnProvider } from "./types";

const providers: Record<string, TryOnProvider> = {
  gemini: geminiProvider,
};

/** Fournisseur actif, choisi par la variable TRYON_PROVIDER. */
export function getTryOnProvider(): TryOnProvider {
  const name = serverEnv.tryOnProvider;
  const provider = providers[name];
  if (!provider) throw new Error(`Fournisseur try-on inconnu : ${name}`);
  return provider;
}

export type { TryOnProvider, TryOnInput, TryOnOutput } from "./types";
export { TryOnProviderError } from "./types";
