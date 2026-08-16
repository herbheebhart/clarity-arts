import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, KeyRound, Moon, Plus, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings, uid } from "@/lib/store";
import { IMAGE_MODELS } from "./image-studio";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VisionAI" },
      {
        name: "description",
        content: "Switch theme, choose your language, pick AI models and manage your API keys.",
      },
      { property: "og:title", content: "Settings — VisionAI" },
      {
        property: "og:description",
        content: "Theme, language, connected AI providers and API key management.",
      },
    ],
  }),
  component: SettingsPage,
});

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
  { id: "es", label: "Español" },
  { id: "pt", label: "Português" },
  { id: "yo", label: "Yorùbá" },
  { id: "ha", label: "Hausa" },
  { id: "ar", label: "العربية" },
];

const CHAT_MODELS = [
  { id: "google/gemini-3.6-flash", label: "Balanced — Gemini 3.6 Flash" },
  { id: "google/gemini-3.1-flash-lite", label: "Fastest — Gemini 3.1 Flash Lite" },
  { id: "google/gemini-3.1-pro-preview", label: "Deep thinking — Gemini 3.1 Pro" },
];

function SettingsPage() {
  const { settings, update } = useSettings();
  const [provider, setProvider] = useState("");
  const [key, setKey] = useState("");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader title="Settings" description="Make VisionAI feel like yours." />

      <section className="surface-card space-y-5 p-5 sm:p-6">
        <h2 className="text-lg font-bold">Appearance</h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {settings.theme === "dark" ? (
              <Moon className="size-5 shrink-0" />
            ) : (
              <Sun className="size-5 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium">Dark mode</p>
              <p className="text-sm text-muted-foreground">Easier on the eyes at night.</p>
            </div>
          </div>
          <Switch
            checked={settings.theme === "dark"}
            onCheckedChange={(checked) => update({ theme: checked ? "dark" : "light" })}
            aria-label="Toggle dark mode"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={settings.language} onValueChange={(v) => update({ language: v })}>
            <SelectTrigger id="language" className="h-12 w-full rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="surface-card space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="min-w-0 text-lg font-bold">Connected AI providers</h2>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <CheckCircle2 className="size-3.5" /> Connected
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          VisionAI comes ready to use — chat and image models are connected out of the box.
        </p>

        <div className="space-y-2">
          <Label htmlFor="chat-model">Chat model</Label>
          <Select value={settings.chatModel} onValueChange={(v) => update({ chatModel: v })}>
            <SelectTrigger id="chat-model" className="h-12 w-full rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAT_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-model">Image model</Label>
          <Select value={settings.imageModel} onValueChange={(v) => update({ imageModel: v })}>
            <SelectTrigger id="image-model" className="h-12 w-full rounded-2xl">
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
      </section>

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-bold">Your own API keys</h2>
        <p className="text-sm text-muted-foreground">
          Optional. Keys you add here are stored only on this device and are never sent anywhere.
        </p>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
          <Input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Provider name"
            className="h-12 rounded-2xl"
            aria-label="Provider name"
          />
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="API key"
            type="password"
            className="h-12 rounded-2xl"
            aria-label="API key"
          />
          <Button
            className="h-12 rounded-2xl"
            onClick={() => {
              if (!provider.trim() || !key.trim()) {
                toast.error("Add a provider name and key");
                return;
              }
              update({
                customKeys: [
                  ...settings.customKeys,
                  { id: uid(), provider: provider.trim(), key: key.trim() },
                ],
              });
              setProvider("");
              setKey("");
              toast.success("Key saved on this device");
            }}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {settings.customKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No personal keys added.</p>
          ) : (
            settings.customKeys.map((k) => (
              <div
                key={k.id}
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3"
              >
                <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{k.provider}</span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  ••••{k.key.slice(-4)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete key"
                  onClick={() =>
                    update({ customKeys: settings.customKeys.filter((x) => x.id !== k.id) })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}