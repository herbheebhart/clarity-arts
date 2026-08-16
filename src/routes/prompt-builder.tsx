import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Loader2, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { buildPrompt } from "@/lib/ai.functions";
import { saveToProjects, uid } from "@/lib/store";

export const Route = createFileRoute("/prompt-builder")({
  head: () => ({
    meta: [
      { title: "Prompt Builder — VisionAI" },
      {
        name: "description",
        content:
          "Turn a simple idea into a structured prompt with subject, style, lighting, camera, background, colors and composition.",
      },
      { property: "og:title", content: "Prompt Builder — VisionAI" },
      {
        property: "og:description",
        content: "One idea in, a professional structured prompt out — with one-click copy.",
      },
    ],
  }),
  component: PromptBuilder,
});

const FIELDS = [
  { key: "subject", label: "Subject" },
  { key: "style", label: "Style" },
  { key: "lighting", label: "Lighting" },
  { key: "camera", label: "Camera" },
  { key: "background", label: "Background" },
  { key: "colors", label: "Colors" },
  { key: "composition", label: "Composition" },
  { key: "extraDetails", label: "Extra Details" },
] as const;

type Structured = Record<(typeof FIELDS)[number]["key"], string>;

function PromptBuilder() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Structured | null>(null);

  const finalPrompt = result
    ? FIELDS.map(({ key, label }) => `${label}: ${result[key]}`).join("\n")
    : "";

  async function onBuild() {
    if (!idea.trim() || loading) return;
    setLoading(true);
    try {
      const structured = await buildPrompt({ data: { idea: idea.trim() } });
      setResult(structured as Structured);
      toast.success("Prompt structured");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build the prompt");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Prompt Builder"
        description="Type a simple idea. Get a professional prompt."
      />

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="idea">Your idea</Label>
          <Textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="A cat astronaut floating above the moon"
            className="min-h-24 rounded-2xl text-base"
          />
        </div>
        <Button
          className="h-14 w-full rounded-2xl text-base"
          onClick={() => void onBuild()}
          disabled={loading || !idea.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Building…
            </>
          ) : (
            <>
              <Wand2 className="size-5" /> Build my prompt
            </>
          )}
        </Button>
      </section>

      {result ? (
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="surface-card space-y-2 p-4 transition-shadow hover:shadow-lift">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {label}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Copy ${label}`}
                    onClick={() => copy(result[key])}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
                <p className="text-sm leading-relaxed">{result[key]}</p>
              </div>
            ))}
          </div>

          <div className="surface-card space-y-3 p-5">
            <h2 className="text-lg font-bold">Final prompt</h2>
            <pre className="overflow-x-auto rounded-2xl bg-secondary p-4 text-sm whitespace-pre-wrap">
              {finalPrompt}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-2xl" onClick={() => copy(finalPrompt)}>
                <Copy className="size-4" /> Copy full prompt
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  saveToProjects("prompts", {
                    id: uid(),
                    title: idea.slice(0, 48) || "Untitled prompt",
                    text: finalPrompt,
                    createdAt: Date.now(),
                  });
                  toast.success("Saved to Projects");
                }}
              >
                <Save className="size-4" /> Save to Projects
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}