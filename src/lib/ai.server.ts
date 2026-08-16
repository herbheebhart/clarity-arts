import { generateText } from "ai";
import { createLovableAiGatewayProvider, getApiKey, GATEWAY_URL } from "./ai-gateway.server";

export type GeneratedImage = { url: string; text: string };

export async function generateImageFromPrompt(input: {
  model: string;
  prompt: string;
  negativePrompt?: string | undefined;
  aspectRatio?: string | undefined;
  quality?: string | undefined;
}): Promise<GeneratedImage> {
  const parts = [input.prompt];
  if (input.aspectRatio && input.aspectRatio !== "1:1")
    parts.push(`Aspect ratio: ${input.aspectRatio}.`);
  if (input.quality) parts.push(`Rendering quality: ${input.quality}.`);
  if (input.negativePrompt?.trim()) parts.push(`Avoid: ${input.negativePrompt.trim()}.`);

  const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Lovable-API-Key": getApiKey(),
    },
    body: JSON.stringify({
      model: input.model,
      messages: [{ role: "user", content: parts.join(" ") }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`Image generation failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
        images?: Array<{ image_url?: { url?: string } }>;
      };
    }>;
  };
  const message = data.choices?.[0]?.message;
  const url = message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("The model did not return an image. Try rewording your prompt.");
  return { url, text: message?.content ?? "" };
}

export type StructuredPrompt = {
  subject: string;
  style: string;
  lighting: string;
  camera: string;
  background: string;
  colors: string;
  composition: string;
  extraDetails: string;
};

const FIELDS: (keyof StructuredPrompt)[] = [
  "subject",
  "style",
  "lighting",
  "camera",
  "background",
  "colors",
  "composition",
  "extraDetails",
];

export async function structurePrompt(idea: string): Promise<StructuredPrompt> {
  const gateway = createLovableAiGatewayProvider(getApiKey());
  const result = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    system:
      "You expand a short image idea into a professional, structured image prompt. Reply with ONLY a JSON object (no markdown fences) with exactly these string keys: subject, style, lighting, camera, background, colors, composition, extraDetails. Each value is one vivid, concrete phrase under 200 characters. Never leave a value empty.",
    prompt: `Idea: ${idea}`,
  });

  const raw = result.text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  let parsed: Record<string, unknown> = {};
  if (start !== -1 && end > start) {
    try {
      parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }

  const output = {} as StructuredPrompt;
  for (const field of FIELDS) {
    const value = parsed[field];
    output[field] = typeof value === "string" && value.trim() ? value.trim().slice(0, 300) : "—";
  }
  return output;
}