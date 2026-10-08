import { GoogleGenAI } from "@google/genai";
import { serverEnv } from "@/lib/env";
import { familyOf } from "@/lib/catalog/taxonomy";
import { TryOnProviderError, type TryOnInput, type TryOnOutput, type TryOnProvider } from "./types";

const DEFAULT_MODEL = "gemini-2.5-flash-image";
// 2 tentatives max par essayage : doit tenir dans le `maxDuration` (120 s) des routes
const REQUEST_TIMEOUT_MS = 45_000;

function buildPrompt(info: TryOnInput["garmentInfo"]) {
  const family = familyOf(info.category);
  const where =
    family === "shoes"
      ? "on their feet, replacing their current footwear"
      : family === "accessory"
        ? "worn naturally as an accessory"
        : family === "bottom"
          ? "on their lower body, replacing their current bottoms"
          : "on their upper body, replacing their current top";

  return [
    "You are a virtual try-on engine for an online clothing store.",
    "Image 1 is the customer's reference photo. Image 2 is the product packshot.",
    `Generate a photorealistic image of the same person from image 1 wearing the product from image 2 ${where}.`,
    `Product: ${info.name} (${info.category}${info.color ? `, ${info.color}` : ""}).`,
    info.description ? `Product details: ${info.description}` : "",
    "Strict rules:",
    "- Preserve the person's identity exactly: face, skin tone, hair, body shape, pose and proportions.",
    "- Preserve the background, framing and lighting of image 1.",
    "- Reproduce the product faithfully: color, pattern, fabric, cut, length and fit as shown in image 2.",
    "- Keep every other garment the person is wearing unchanged unless it is replaced by the product.",
    "- No text, no logos added, no watermark, no split view: output a single natural photo.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Fournisseur Gemini : composition multi-images avec le modèle de génération d'image. */
export const geminiProvider: TryOnProvider = {
  name: "gemini",

  async generate(input: TryOnInput): Promise<TryOnOutput> {
    const ai = new GoogleGenAI({
      apiKey: serverEnv.geminiApiKey,
      httpOptions: { timeout: REQUEST_TIMEOUT_MS },
    });
    const model = process.env.GEMINI_IMAGE_MODEL ?? DEFAULT_MODEL;

    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: input.person.mimeType, data: input.person.data.toString("base64") } },
              { inlineData: { mimeType: input.garment.mimeType, data: input.garment.data.toString("base64") } },
              { text: buildPrompt(input.garmentInfo) },
            ],
          },
        ],
        config: { responseModalities: ["IMAGE"] },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const retryable = /429|503|overloaded|deadline|timeout|timed out|aborted/i.test(message);
      throw new TryOnProviderError(`Gemini : ${message}`, retryable);
    }

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const image = parts.find((p) => p.inlineData?.data);
    if (!image?.inlineData?.data) {
      const reason = response.candidates?.[0]?.finishReason ?? "aucune image renvoyée";
      const text = parts.find((p) => p.text)?.text;
      throw new TryOnProviderError(`Gemini : ${reason}${text ? ` (${text.slice(0, 200)})` : ""}`);
    }

    return {
      data: Buffer.from(image.inlineData.data, "base64"),
      mimeType: image.inlineData.mimeType ?? "image/png",
    };
  },
};
