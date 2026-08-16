import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Heart, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROMPT_CATEGORIES, PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import { STORAGE_KEYS, usePersistentState } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prompt-library")({
  head: () => ({
    meta: [
      { title: "Prompt Library — VisionAI" },
      {
        name: "description",
        content:
          "Ready-made prompt templates for product photos, thumbnails, posters, portraits, logos, anime and more.",
      },
      { property: "og:title", content: "Prompt Library — VisionAI" },
      {
        property: "og:description",
        content: "Search, favourite and copy proven prompt templates in one tap.",
      },
    ],
  }),
  component: PromptLibrary,
});

function PromptLibrary() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = usePersistentState<string[]>(STORAGE_KEYS.favorites, []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPT_TEMPLATES.filter((t) => {
      const matchesCategory =
        category === "All" ||
        (category === "Favorites" ? favorites.includes(t.id) : t.category === category);
      const matchesQuery =
        !q || t.title.toLowerCase().includes(q) || t.text.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category, favorites]);

  const chips = ["All", "Favorites", ...PROMPT_CATEGORIES];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Prompt Library"
        description="Proven prompts you can use right away."
      />

      <div className="relative">
        <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts…"
          className="h-14 rounded-2xl pl-12 text-base"
          aria-label="Search prompts"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              category === c
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="surface-card p-10 text-center text-sm text-muted-foreground">
          No prompts match your search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => {
            const isFav = favorites.includes(t.id);
            return (
              <article
                key={t.id}
                className="surface-card flex flex-col gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{t.title}</h2>
                    <p className="text-xs text-muted-foreground">{t.category}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={isFav ? "Remove favourite" : "Add favourite"}
                    onClick={() =>
                      setFavorites((prev) =>
                        prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id],
                      )
                    }
                  >
                    <Heart className={cn("size-5", isFav && "fill-primary text-primary")} />
                  </Button>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      void navigator.clipboard.writeText(t.text);
                      toast.success("Prompt copied");
                    }}
                  >
                    <Copy className="size-4" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      void navigator.clipboard.writeText(t.text);
                      toast.success("Prompt copied — paste it in the studio");
                      void navigate({ to: "/image-studio" });
                    }}
                  >
                    <Sparkles className="size-4" /> Use it
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}