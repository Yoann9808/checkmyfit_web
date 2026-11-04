/**
 * Test du pipeline IA sans base de données : appelle Gemini avec le même prompt
 * que src/lib/tryon/providers/gemini.ts et écrit les rendus sur disque.
 * Prérequis : GEMINI_API_KEY dans .env.local.
 * Usage : node scripts/test-gemini.mjs <photo-personne|synth> <dossier-sortie> [modèle] [vêtement.webp ...]
 *   - "synth" génère une photo de mannequin fictif via Gemini (réutilisée si déjà présente).
 *   - Vêtements : fichiers de public/seed (par défaut : chemise-oxford-bleue, robe-drapee-emeraude).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { GoogleGenAI } from "@google/genai";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY manquante dans .env.local");

const [personArg = "synth", outDir = "tryon-test", modelArg, ...garmentArgs] = process.argv.slice(2);
const model = modelArg || env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const garments = garmentArgs.length ? garmentArgs : ["chemise-oxford-bleue.webp", "robe-drapee-emeraude.webp"];
mkdirSync(outDir, { recursive: true });

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions: { timeout: 90_000 } });
const mimeOf = (f) =>
  ({ ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" })[extname(f).toLowerCase()];

// Métadonnées des produits du seed (nom, catégorie, couleur, description)
const seedInfo = {
  "chemise-oxford-bleue.webp": { name: "Chemise Oxford bleue", category: "Chemise manches longues", color: "Bleu", description: "Chemise en coton Oxford, coupe droite, col boutonné." },
  "chemise-popeline-noire.webp": { name: "Chemise popeline noire", category: "Chemise manches longues", color: "Noir", description: "Chemise en popeline de coton, coupe ajustée." },
  "blouse-satinee-orange.webp": { name: "Blouse satinée orange", category: "Chemise manches longues", color: "Orange", description: "Blouse fluide en satin, manches longues." },
  "robe-drapee-emeraude.webp": { name: "Robe drapée émeraude", category: "Robe", color: "Vert", description: "Robe courte drapée, bretelles larges, décolleté carré." },
  "escarpins-vernis-rouges.webp": { name: "Escarpins vernis rouges", category: "Chaussures", color: "Rouge", description: "Escarpins en cuir verni, talon 8 cm." },
  "sweat-capuche.webp": { name: "Sweat à capuche", category: "Sweat-shirt", color: "Gris", description: "Sweat molletonné à capuche, coupe décontractée." },
  "tshirt-col-rond-blanc.webp": { name: "T-shirt col rond blanc", category: "T-shirt / Débardeur", color: "Blanc", description: "T-shirt en coton bio, col rond." },
};

// Copie fidèle de familyOf (src/lib/catalog/taxonomy.ts) et buildPrompt (providers/gemini.ts)
const BOTTOM_CATEGORIES = ["Pantalon", "Jean", "Short / Bermuda", "Jogging", "Jupe"];
function familyOf(category) {
  if (category === "Chaussures") return "shoes";
  if (category === "Accessoires") return "accessory";
  if (BOTTOM_CATEGORIES.includes(category)) return "bottom";
  return "top";
}
const FULL_BODY_CATEGORIES = ["Robe", "Combinaison"];
const OUTERWEAR_CATEGORIES = ["Veste", "Blazer", "Manteau", "Parka", "Doudoune", "Trench-coat", "Coupe-vent"];
function placementOf(category) {
  if (FULL_BODY_CATEGORIES.includes(category))
    return "as a complete outfit, replacing both their current top and their current bottoms (no trousers or jeans visible underneath)";
  if (OUTERWEAR_CATEGORIES.includes(category))
    return "as an outer layer over their current top, keeping the top visible underneath where the garment is open";
  const family = familyOf(category);
  if (family === "shoes") return "on their feet, replacing their current footwear";
  if (family === "accessory") return "worn naturally as an accessory";
  if (family === "bottom") return "on their lower body, replacing their current bottoms";
  return "on their upper body, replacing their current top";
}
function buildPrompt(info) {
  const where = placementOf(info.category);
  return [
    "You are a virtual try-on engine for an online clothing store.",
    "Image 1 is the customer's reference photo. Image 2 is the product packshot.",
    `Generate a photorealistic image of the same person from image 1 wearing the product from image 2 ${where}.`,
    `Product: ${info.name} (${info.category}${info.color ? `, ${info.color}` : ""}).`,
    info.description ? `Product details: ${info.description}` : "",
    "Strict rules:",
    "- Preserve the person's identity exactly: face, skin tone, hair, body shape, pose and proportions.",
    "- Preserve the background, framing and lighting of image 1.",
    "- Reproduce the product faithfully: color, pattern, fabric, cut, length, sleeves, neckline and fit exactly as shown in image 2. If the text description conflicts with image 2, image 2 wins.",
    "- Keep every other garment the person is wearing unchanged unless it is replaced by the product.",
    "- No text, no logos added, no watermark, no split view: output a single natural photo.",
  ]
    .filter(Boolean)
    .join("\n");
}

function firstImage(response) {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) {
    const reason = response.candidates?.[0]?.finishReason ?? "aucune image renvoyée";
    const text = parts.find((p) => p.text)?.text;
    throw new Error(`${reason}${text ? ` (${text.slice(0, 200)})` : ""}`);
  }
  return { data: Buffer.from(img.inlineData.data, "base64"), mimeType: img.inlineData.mimeType ?? "image/png" };
}
const ext = (mime) => (mime === "image/jpeg" ? ".jpg" : mime === "image/webp" ? ".webp" : ".png");
const usage = (r) =>
  r.usageMetadata ? `tokens in/out ${r.usageMetadata.promptTokenCount}/${r.usageMetadata.candidatesTokenCount}` : "";

async function timed(label, fn) {
  const t0 = Date.now();
  try {
    const r = await fn();
    console.log(`OK  ${label} — ${((Date.now() - t0) / 1000).toFixed(1)} s ${r.note ?? ""}`);
    return r;
  } catch (e) {
    console.log(`KO  ${label} — ${((Date.now() - t0) / 1000).toFixed(1)} s — ${e.message}`);
    return null;
  }
}

// 1. Photo de référence
let person;
if (personArg === "synth") {
  const synthPath = join(outDir, "person-synth.png");
  if (existsSync(synthPath)) {
    person = { data: readFileSync(synthPath), mimeType: "image/png" };
    console.log("- photo synthétique réutilisée :", synthPath);
  } else {
    const r = await timed("génération mannequin fictif", async () => {
      const response = await ai.models.generateContent({
        model,
        contents:
          "Photorealistic full-body photo of a fictional adult woman in her thirties, standing facing the camera, head to toe visible, neutral pose, arms relaxed, wearing a plain light grey t-shirt and dark blue jeans with white sneakers, plain beige wall background, soft natural indoor lighting, smartphone photo style. Portrait orientation 3:4.",
        config: { responseModalities: ["IMAGE"] },
      });
      const img = firstImage(response);
      writeFileSync(synthPath, img.data);
      return { ...img, note: usage(response) };
    });
    if (!r) process.exit(1);
    person = { data: r.data, mimeType: r.mimeType };
    console.log("  ->", synthPath);
  }
} else {
  person = { data: readFileSync(personArg), mimeType: mimeOf(personArg) ?? "image/jpeg" };
  console.log("- photo de référence :", personArg);
}

// 2. Essayages
console.log(`- modèle : ${model}`);
for (const g of garments) {
  const file = g.includes("/") || g.includes("\\") ? g : join("public/seed", g);
  const info = seedInfo[basename(g)] ?? { name: basename(g, extname(g)), category: "Hauts", color: null, description: null };
  const garment = { data: readFileSync(file), mimeType: mimeOf(file) ?? "image/webp" };
  await timed(`essayage ${info.name}`, async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: person.mimeType, data: person.data.toString("base64") } },
            { inlineData: { mimeType: garment.mimeType, data: garment.data.toString("base64") } },
            { text: buildPrompt(info) },
          ],
        },
      ],
      config: { responseModalities: ["IMAGE"] },
    });
    const img = firstImage(response);
    const out = join(outDir, `${basename(g, extname(g))}--${model}${ext(img.mimeType)}`);
    writeFileSync(out, img.data);
    return { note: `${usage(response)} -> ${out}` };
  });
}
