"use client";

import type { HTMLAttributes } from "react";
import { useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Bug, CodeXml, X, Zap } from "lucide-react";

type RoadmapItem = {
  title: string;
  description: string;
  status: "backlog" | "planned" | "in-progress" | "live";
  code: string;
  type: "bug" | "feature";
};

const items: RoadmapItem[] = [
  { title: "Dark mode polish", description: "Fix a few contrast issues in secondary buttons and muted text.", status: "backlog", code: "TBD", type: "bug" },
  { title: "Keyboard shortcuts", description: "J/K to move cards, Esc to close the modal.", status: "backlog", code: "TBD", type: "feature" },
  { title: "CSV export", description: "Dump the current column to a file for spreadsheets.", status: "backlog", code: "TBD", type: "feature" },
  { title: "Custom column labels", description: "Let people rename Backlog / Planned / etc. for their workflow.", status: "backlog", code: "TBD", type: "feature" },
  { title: "Mobile swipe between columns", description: "Horizontal swipe on small screens instead of four skinny columns.", status: "backlog", code: "TBD", type: "feature" },
  { title: "Empty state copy", description: "Friendlier message when a column has no cards yet.", status: "planned", code: "b2a91c4f", type: "bug" },
  { title: "Drag and drop between columns", description: "Reorder cards and change status in one motion.", status: "planned", code: "7e3d88a1", type: "feature" },
  { title: "Due dates on cards", description: "Optional date chip with a soft highlight when overdue.", status: "planned", code: "1f9c62bb", type: "feature" },
  { title: "Column WIP limits", description: "Show a warning when In Progress exceeds a set number.", status: "in-progress", code: "4d8a0e33", type: "feature" },
  { title: "Board layout", description: "Four columns, scroll per column, modal for details.", status: "live", code: "TBD", type: "feature" },
  { title: "Static demo data", description: "Everything ships as hardcoded JSON so the repo runs with zero setup.", status: "live", code: "TBD", type: "feature" },
];

const columns: Array<{ status: RoadmapItem["status"]; label: string }> = [
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

export default function Home() {
  const [selected, setSelected] = useState<RoadmapItem | null>(null);

  return (
    <main className="roadmap-bg min-h-screen px-6 py-12">
      <div className="mx-auto flex h-[calc(100vh-6rem)] w-full max-w-7xl flex-col">
        <header className="mb-6">
          <h1 className="text-4xl font-black tracking-tight text-neutral-100 sm:text-5xl">
            Kanbanish <span className="font-normal text-neutral-300">Roadmap</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Static board rebuild. No backend. No dashboard. Just the roadmap.
          </p>
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
                        key={`${item.status}-${item.title}`}
                        className="cursor-pointer transition-colors hover:border-neutral-700 hover:bg-neutral-900/80"
                        onClick={() => setSelected(item)}
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
          onClick={() => setSelected(null)}
        >
          <div
            className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-base font-semibold text-neutral-100">{selected.title}</span>
              <button
                type="button"
                onClick={() => setSelected(null)}
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
          </div>
        </div>
      )}
    </main>
  );
}
