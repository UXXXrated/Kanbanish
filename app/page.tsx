"use client";

import type { FormEvent, HTMLAttributes } from "react";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Bug, CodeXml, Pencil, Plus, Trash2, X, Zap } from "lucide-react";
import seedItems from "../data/board.json";

type RoadmapStatus = "backlog" | "planned" | "in-progress" | "live";
type RoadmapType = "bug" | "feature";

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  code: string;
  type: RoadmapType;
};

type RoadmapDraft = Omit<RoadmapItem, "id">;

const STORAGE_KEY = "kanbanish-board:v1";

const emptyDraft: RoadmapDraft = {
  title: "",
  description: "",
  status: "backlog",
  code: "TBD",
  type: "feature",
};

function getSeedItems(): RoadmapItem[] {
  return (seedItems as RoadmapItem[]).map((item) => ({ ...item }));
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `card-${Date.now()}`;
}

const columns: Array<{ status: RoadmapStatus; label: string }> = [
  { status: "backlog", label: "Backlog" },
  { status: "planned", label: "Planned" },
  { status: "in-progress", label: "In Progress" },
  { status: "live", label: "Live" },
];

function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border p-4 text-left shadow-sm",
        "bg-neutral-900/60 backdrop-blur-md border-neutral-800/50",
        className,
      )}
      {...props}
    />
  );
}

function ItemPill({ item }: { item: RoadmapItem }) {
  const isBug = item.type === "bug";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl px-1.5 py-0.5 text-xs font-medium",
        isBug ? "bg-yellow-950 text-yellow-400" : "bg-blue-950 text-blue-400",
      )}
    >
      {isBug ? <Bug size={12} className="mr-1" /> : <Zap size={12} className="mr-1" />}
      {isBug ? "Fix" : "Feature"}
    </span>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-neutral-300">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function Home() {
  const [items, setItems] = useState<RoadmapItem[]>(() => getSeedItems());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<RoadmapDraft>(emptyDraft);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RoadmapItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHasLoadedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hasLoadedStorage, items]);

  function closeEditor() {
    setIsCreating(false);
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function openCreate() {
    setSelectedId(null);
    setEditingId(null);
    setDraft(emptyDraft);
    setIsCreating(true);
  }

  function openEdit(item: RoadmapItem) {
    setIsCreating(false);
    setEditingId(item.id);
    setDraft({
      title: item.title,
      description: item.description,
      status: item.status,
      code: item.code,
      type: item.type,
    });
  }

  function handleDraftChange<K extends keyof RoadmapDraft>(key: K, value: RoadmapDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextDraft = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      code: draft.code.trim() || "TBD",
    };

    if (!nextDraft.title || !nextDraft.description) {
      return;
    }

    if (editingId) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...nextDraft,
              }
            : item,
        ),
      );
      setSelectedId(editingId);
    } else {
      const nextItem: RoadmapItem = {
        id: makeId(),
        ...nextDraft,
      };

      setItems((current) => [nextItem, ...current]);
      setSelectedId(nextItem.id);
    }

    closeEditor();
  }

  function handleDelete(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId));
    setSelectedId(null);
    closeEditor();
  }

  return (
    <main className="roadmap-bg min-h-screen px-6 py-12">
      <div className="mx-auto flex h-[calc(100vh-6rem)] w-full max-w-7xl flex-col">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-neutral-100 sm:text-5xl">
              Kanbanish <span className="font-normal text-neutral-300">Roadmap</span>
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Local-first board. No backend. No dashboard. Changes stay in this browser.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
            onClick={openCreate}
          >
            <Plus size={16} />
            New Card
          </button>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => {
            const columnItems = items.filter((item) => item.status === column.status);

            return (
              <div key={column.status} className="flex min-h-0 flex-col">
                <div className="sticky top-0 z-10 mb-2 flex flex-shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-950/80 pb-2 backdrop-blur">
                  <span className="text-xl font-semibold text-neutral-100">{column.label}</span>
                  <span className="ml-auto rounded-full border border-neutral-800/50 bg-neutral-900/60 px-2 py-0.5 text-xs font-medium text-neutral-400">
                    {columnItems.length}
                  </span>
                </div>

                <div className="roadmap-scroll flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                  {columnItems.length === 0 ? (
                    <p className="pt-1 text-xs text-neutral-600">Nothing here</p>
                  ) : (
                    columnItems.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer transition-colors hover:border-neutral-700 hover:bg-neutral-900/80"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <span className="block text-sm font-medium leading-relaxed text-neutral-300 transition-colors hover:text-neutral-200">
                          {item.title}
                        </span>
                        <div className="mt-2 flex items-center gap-1.5">
                          <ItemPill item={item} />
                          <span className="inline-flex items-center gap-1 rounded-2xl bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-gray-400">
                            <CodeXml size={12} />
                            {item.code}
                          </span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-base font-semibold text-neutral-100">{selected.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="flex-shrink-0 text-neutral-500 transition-colors hover:text-neutral-300"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm font-medium leading-relaxed text-neutral-400">
              {selected.description}
            </p>

            <div className="flex items-center gap-2">
              <ItemPill item={selected} />
              <span className="inline-flex items-center gap-1 rounded bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-gray-400">
                <CodeXml size={12} />
                {selected.code}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-700 hover:bg-neutral-800/70"
                onClick={() => openEdit(selected)}
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-red-950 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/60"
                onClick={() => handleDelete(selected.id)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {(isCreating || editingId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeEditor}
        >
          <form
            className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSave}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-100">
                  {editingId ? "Edit card" : "New card"}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Changes are saved in this browser only.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="flex-shrink-0 text-neutral-500 transition-colors hover:text-neutral-300"
                aria-label="Close editor"
              >
                <X size={16} />
              </button>
            </div>

            <FormField label="Title">
              <input
                required
                value={draft.title}
                onChange={(event) => handleDraftChange("title", event.target.value)}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-700"
                placeholder="Card title"
              />
            </FormField>

            <FormField label="Description">
              <textarea
                required
                rows={4}
                value={draft.description}
                onChange={(event) => handleDraftChange("description", event.target.value)}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-700"
                placeholder="What is this card about?"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Status">
                <select
                  value={draft.status}
                  onChange={(event) =>
                    handleDraftChange("status", event.target.value as RoadmapStatus)
                  }
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-neutral-700"
                >
                  {columns.map((column) => (
                    <option key={column.status} value={column.status}>
                      {column.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Type">
                <select
                  value={draft.type}
                  onChange={(event) => handleDraftChange("type", event.target.value as RoadmapType)}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors focus:border-neutral-700"
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Fix</option>
                </select>
              </FormField>
            </div>

            <FormField label="Code">
              <input
                value={draft.code}
                onChange={(event) => handleDraftChange("code", event.target.value)}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-700"
                placeholder="TBD"
              />
            </FormField>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800/70"
                onClick={closeEditor}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-950 transition-opacity hover:opacity-90"
              >
                {editingId ? "Save changes" : "Create card"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
