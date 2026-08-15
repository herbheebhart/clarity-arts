import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateImageFromPrompt, structurePrompt } from "./ai.server";

export const generateImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        model: z.string(),
        prompt: z.string().min(1),
        negativePrompt: z.string().optional(),
        aspectRatio: z.string().optional(),
        quality: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => generateImageFromPrompt(data));

export const buildPrompt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ idea: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => structurePrompt(data.idea));