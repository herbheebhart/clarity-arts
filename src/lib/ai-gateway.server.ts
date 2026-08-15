import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export function getApiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key;
}

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-gateway",
    baseURL: GATEWAY_URL,
    headers: { "Lovable-API-Key": apiKey },
  });
}