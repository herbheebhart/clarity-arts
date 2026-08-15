import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { createLovableAiGatewayProvider, getApiKey } from "@/lib/ai-gateway.server";

type IncomingMessage = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages?: IncomingMessage[];
            model?: string;
          };
          const messages = (body.messages ?? []).filter(
            (m) => typeof m?.content === "string" && m.content.length > 0,
          );
          if (messages.length === 0) {
            return new Response("No messages provided", { status: 400 });
          }

          const gateway = createLovableAiGatewayProvider(getApiKey());
          const result = streamText({
            model: gateway(body.model || "google/gemini-3.6-flash"),
            system:
              "You are VisionAI Research, a friendly expert assistant. Answer clearly and simply, using short paragraphs, headings and bullet points in markdown. Be accurate and helpful.",
            messages,
          });

          return result.toTextStreamResponse();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unexpected error";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});