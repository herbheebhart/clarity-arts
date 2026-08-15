import { generateText, Output } from "ai";
import { z } from "zod";
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

const structuredSchema = z.object({
  subject: z.string(),
  style: z.string(),
  lighting: z.string(),
  camera: z.string(),
  background: z.string(),
  colors: z.string(),
  composition: z.string(),
  extraDetails: z.string(),
});

export type StructuredPrompt = z.infer<typeof structuredSchema>;

export async function structurePrompt(idea: string): Promise<StructuredPrompt> {
  const gateway = createLovableAiGatewayProvider(getApiKey());
  const { output } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    output: Output.object({ schema: structuredSchema }),
    system:
      "You expand a short image idea into a professional, structured image prompt. Each field is one vivid, concrete sentence or phrase. Never leave a field empty. Keep every field under 200 characters.",
    prompt: `Idea: ${idea}`,
  });
  return output as StructuredPrompt;
}