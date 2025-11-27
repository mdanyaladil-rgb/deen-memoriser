// app/essentials/EssentialsClient.tsx
"use client";

import { useMemo, useState } from "react";
import { KEY_AYAT, KeyAyahCategory } from "@/data/keyAyat";

const CATEGORY_LABELS: Record<KeyAyahCategory, string> = {
  protection: "Protection",
  positivity: "Positivity & Hope",
  tawakkul: "Trust in Allah",
  character: "Character & Manners",
  discipline: "Habits & Discipline",
  dua: "Du‘a from the Qur’an",
};

type Ayah = (typeof KEY_AYAT)[number];

export default function EssentialsClient() {
  const [activeCategory, setActiveCategory] = useState<KeyAyahCategory | "all">(
    "all"
  );
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Ayah | null>(null);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return KEY_AYAT.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!search) return true;

      const haystack = (
        item.label +
        " " +
        item.surahRef +
        " " +
        item.tagline +
        " " +
        item.translation +
        " " +
        item.transliteration +
        " " +
        CATEGORY_LABELS[item.category]
      ).toLowerCase();

      return haystack.includes(search);
    });
  }, [activeCategory, q]);

  return (
    <div className="relative min-h-screen">
      {/* Background stack */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Soft emerald gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100" />

        {/* Subtle geometric dot pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(16,78,60,0.12) 1px, transparent 0)",
            backgroundSize: "26px 26px",
            opacity: 0.3,
          }}
        />

        {/* Light vertical fade to keep center clean */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/80" />
      </div>

      <main className="relative mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 space-y-3 text-center">
          <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs font-medium text-emerald-800">
            Qur’an Essentials
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Key ayat for{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              daily life
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-600">
            Short, powerful ayat presented in a mushaf-style layout so you can
            quote, reflect, and (soon) save them for memorisation.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                activeCategory === "all"
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400"
              }`}
            >
              All
            </button>
            {(
              Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]
            ).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  activeCategory === cat
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ayat or topics..."
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm outline-none ring-emerald-500/30 focus:border-emerald-400 focus:ring"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
              ⌕
            </span>
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            No ayat match that search yet. Try a different word or category.
          </p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group relative flex cursor-pointer flex-col rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
                onClick={() => setExpanded(item)}
              >
                {/* Top badges */}
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {item.surahRef}
                  </span>
                </div>

                {/* Mushaf-style body */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-center font-arabic text-xl leading-relaxed text-emerald-900 line-clamp-3"
                  >
                    {item.arabic}
                  </p>
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-xs sm:text-[13px] italic text-slate-700 line-clamp-2">
                    {item.transliteration}
                  </p>
                  <p className="text-[11px] text-slate-700 line-clamp-3">
                    “{item.translation}”
                  </p>
                </div>

                <p className="mt-2 text-[11px] text-slate-600 line-clamp-2">
                  {item.tagline}
                </p>

                {/* Save for memorisation (future) */}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // don’t open modal when saving
                      // TODO: hook into saved ayat system
                    }}
                    className="rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    Save for memorisation (soon)
                  </button>
                  <span className="text-[11px] text-emerald-500 opacity-0 transition group-hover:opacity-100">
                    Tap to zoom
                  </span>
                </div>

                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent group-hover:ring-emerald-400/60" />
              </article>
            ))}
          </section>
        )}
      </main>

      {/* Modal / enlarged view */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={() => setExpanded(null)}
        >
          <div
            className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                  {CATEGORY_LABELS[expanded.category]}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                  {expanded.surahRef}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(null)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              {expanded.label}
            </h2>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5">
              <p
                dir="rtl"
                lang="ar"
                className="text-center font-arabic text-2xl leading-relaxed text-emerald-900"
              >
                {expanded.arabic}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm italic text-slate-700">
                {expanded.transliteration}
              </p>
              <p className="text-sm text-slate-800">“{expanded.translation}”</p>
            </div>

            <p className="mt-3 text-xs text-slate-600">{expanded.tagline}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {expanded.useTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-medium text-emerald-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
