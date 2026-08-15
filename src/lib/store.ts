import { useCallback, useEffect, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { name: string }[];
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};

export type GalleryImage = {
  id: string;
  url: string;
  prompt: string;
  negativePrompt: string;
  model: string;
  aspectRatio: string;
  quality: string;
  createdAt: number;
};

export type SavedPrompt = {
  id: string;
  title: string;
  text: string;
  createdAt: number;
};

export type ProjectItems = {
  chats: Conversation[];
  images: GalleryImage[];
  prompts: SavedPrompt[];
};

export type AppSettings = {
  theme: "light" | "dark";
  language: string;
  chatModel: string;
  imageModel: string;
  customKeys: { id: string; provider: string; key: string }[];
};

export const STORAGE_KEYS = {
  conversations: "visionai.conversations",
  gallery: "visionai.gallery",
  favorites: "visionai.favorites",
  projects: "visionai.projects",
  settings: "visionai.settings",
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  language: "en",
  chatModel: "google/gemini-3.6-flash",
  imageModel: "google/gemini-3.1-flash-image",
  customKeys: [],
};

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...(fallback as object), ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function readRaw<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Hydration-safe persisted state. */
export function usePersistentState<T>(key: string, fallback: T, merge = false) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(merge ? read<T>(key, fallback) : readRaw<T>(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota errors are non-fatal */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

export function useSettings() {
  const [settings, setSettings, hydrated] = usePersistentState<AppSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
    true,
  );

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme, hydrated]);

  const update = useCallback(
    (patch: Partial<AppSettings>) => setSettings((prev) => ({ ...prev, ...patch })),
    [setSettings],
  );

  return { settings, update, hydrated };
}

export const EMPTY_PROJECTS: ProjectItems = { chats: [], images: [], prompts: [] };

export function useProjects() {
  const [projects, setProjects, hydrated] = usePersistentState<ProjectItems>(
    STORAGE_KEYS.projects,
    EMPTY_PROJECTS,
    true,
  );
  return { projects, setProjects, hydrated };
}

/** Append an item to a project bucket without needing the React hook. */
export function saveToProjects<K extends keyof ProjectItems>(
  bucket: K,
  item: ProjectItems[K][number],
) {
  const current = read<ProjectItems>(STORAGE_KEYS.projects, EMPTY_PROJECTS);
  const list = current[bucket] as ProjectItems[K];
  const next: ProjectItems = { ...current, [bucket]: [item, ...list] };
  window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(next));
  window.dispatchEvent(new Event("visionai:projects"));
}