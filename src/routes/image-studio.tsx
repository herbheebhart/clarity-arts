import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Download, ImageIcon, Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateImage } from "@/lib/ai.functions";
import { IMAGE_MODELS } from "@/lib/models";
import {
  STORAGE_KEYS,
  saveToProjects,
  uid,
  usePersistentState,
  useSettings,
  type GalleryImage,
} from "@/lib/store";

export const Route = createFileRoute("/image-studio")({
  head: () => ({
    meta: [
      { title: "Image Studio — VisionAI" },
      {
        name: "description",
        content:
          "Generate images from text with model, aspect ratio and quality controls, then download or save them to projects.",
      },
      { property: "og:title", content: "Image Studio — VisionAI" },
      {
        property: "og:description",
        content: "Describe it, pick a look, and generate beautiful AI images in seconds.",
      },
    ],
  }),
  component: ImageStudio,
});

const RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:2", "2:3"];
const QUALITIES = ["Standard", "High detail", "Ultra realistic"];

function ImageStudio() {
  const { settings, update } = useSettings();
  const [gallery, setGallery] = usePersistentState<GalleryImage[]>(STORAGE_KEYS.gallery, []);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [quality, setQuality] = useState("High detail");
  const [loading, setLoading] = useState(false);

  async function onGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const result = await generateImage({
        data: {
          model: settings.imageModel,
          prompt: prompt.trim(),
          negativePrompt,
          aspectRatio,
          quality,
        },
      });
      const image: GalleryImage = {
        id: uid(),
        url: result.url,
        prompt: prompt.trim(),
        negativePrompt,
        model: settings.imageModel,
        aspectRatio,
        quality,
        createdAt: Date.now(),
      };
      setGallery((prev) => [image, ...prev].slice(0, 24));
      toast.success("Image ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image generation failed");
    } finally {
      setLoading(false);
    }
  }

  function download(image: GalleryImage) {
    const a = document.createElement("a");
    a.href = image.url;
    a.download = `visionai-${image.id}.png`;
    a.click();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Image Studio"
        description="Describe a picture. VisionAI draws it for you."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_1.1fr]">
        <section className="surface-card space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="model">AI model</Label>
            <Select value={settings.imageModel} onValueChange={(v) => update({ imageModel: v })}>
              <SelectTrigger id="model" className="h-12 w-full rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">What should we draw?</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A friendly robot watering plants on a sunny balcony"
              className="min-h-28 rounded-2xl text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="negative">Things to avoid (optional)</Label>
            <Textarea
              id="negative"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, extra fingers, text, watermark"
              className="min-h-20 rounded-2xl text-base"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ratio">Shape</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="ratio" className="h-12 w-full rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATIOS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger id="quality" className="h-12 w-full rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITIES.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="h-14 w-full rounded-2xl text-base"
            onClick={() => void onGenerate()}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Creating your image…
              </>
            ) : (
              <>
                <Sparkles className="size-5" /> Generate image
              </>
            )}
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold">Gallery</h2>
          {gallery.length === 0 ? (
            <div className="surface-card flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
              <ImageIcon className="size-8" />
              <p className="text-sm">Your generated images will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {gallery.map((image) => (
                <article key={image.id} className="surface-card overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    loading="lazy"
                    className="aspect-square w-full bg-secondary object-cover"
                  />
                  <div className="space-y-3 p-4">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{image.prompt}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => download(image)}
                      >
                        <Download className="size-4" /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          void navigator.clipboard.writeText(image.prompt);
                          toast.success("Prompt copied");
                        }}
                      >
                        <Copy className="size-4" /> Prompt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          saveToProjects("images", image);
                          toast.success("Saved to Projects");
                        }}
                      >
                        <Save className="size-4" /> Project
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl"
                        aria-label="Delete image"
                        onClick={() => setGallery((prev) => prev.filter((i) => i.id !== image.id))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}