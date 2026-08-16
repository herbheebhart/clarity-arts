import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Copy, Download, FolderKanban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EMPTY_PROJECTS, STORAGE_KEYS, useProjects, type ProjectItems } from "@/lib/store";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — VisionAI" },
      {
        name: "description",
        content: "Everything you saved: research chats, prompts and generated images in one place.",
      },
      { property: "og:title", content: "Projects — VisionAI" },
      {
        property: "og:description",
        content: "Your saved chats, prompts and images, neatly organised.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, setProjects } = useProjects();

  useEffect(() => {
    function refresh() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.projects);
        setProjects(raw ? { ...EMPTY_PROJECTS, ...(JSON.parse(raw) as ProjectItems) } : EMPTY_PROJECTS);
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("visionai:projects", refresh);
    return () => window.removeEventListener("visionai:projects", refresh);
  }, [setProjects]);

  function remove<K extends keyof ProjectItems>(bucket: K, id: string) {
    setProjects((prev) => ({
      ...prev,
      [bucket]: (prev[bucket] as { id: string }[]).filter((i) => i.id !== id),
    }));
    toast.success("Removed");
  }

  const empty = (label: string) => (
    <div className="surface-card flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
      <FolderKanban className="size-8" />
      <p className="text-sm">No saved {label} yet.</p>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader title="Projects" description="Everything you saved, in one tidy place." />

      <Tabs defaultValue="chats">
        <TabsList className="h-12 rounded-2xl p-1">
          <TabsTrigger value="chats" className="rounded-xl px-4">
            Chats ({projects.chats.length})
          </TabsTrigger>
          <TabsTrigger value="prompts" className="rounded-xl px-4">
            Prompts ({projects.prompts.length})
          </TabsTrigger>
          <TabsTrigger value="images" className="rounded-xl px-4">
            Images ({projects.images.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="mt-4 space-y-3">
          {projects.chats.length === 0
            ? empty("chats")
            : projects.chats.map((c) => (
                <article key={c.id} className="surface-card p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold">{c.title}</h2>
                      <p className="text-xs text-muted-foreground">
                        {c.messages.length} messages · {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete chat"
                      onClick={() => remove("chats", c.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {c.messages[c.messages.length - 1]?.content}
                  </p>
                </article>
              ))}
        </TabsContent>

        <TabsContent value="prompts" className="mt-4 space-y-3">
          {projects.prompts.length === 0
            ? empty("prompts")
            : projects.prompts.map((p) => (
                <article key={p.id} className="surface-card space-y-3 p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <h2 className="min-w-0 truncate font-semibold">{p.title}</h2>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete prompt"
                      onClick={() => remove("prompts", p.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-2xl bg-secondary p-4 text-sm whitespace-pre-wrap">
                    {p.text}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      void navigator.clipboard.writeText(p.text);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="size-4" /> Copy
                  </Button>
                </article>
              ))}
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          {projects.images.length === 0 ? (
            empty("images")
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.images.map((img) => (
                <article key={img.id} className="surface-card overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <div className="space-y-3 p-4">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{img.prompt}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = img.url;
                          a.download = `visionai-${img.id}.png`;
                          a.click();
                        }}
                      >
                        <Download className="size-4" /> Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Delete image"
                        onClick={() => remove("images", img.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}