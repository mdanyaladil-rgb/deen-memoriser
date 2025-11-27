// components/SurahBrowser.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SurahSummary = {
  slug: string;
  name: string;
  arabic: string;
  number: number;
  ayahs: number;
  summary?: string;
};

export default function SurahBrowser({ items }: { items: SurahSummary[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((s) =>
      [s.slug, s.name, s.arabic].some((v) => v.toLowerCase().includes(term))
    );
  }, [q, items]);

  const rememberSurah = (slug: string) => {
    try {
      localStorage.setItem("last_surah_slug", slug);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Search Section – floating card */}
      <div className="rounded-3xl border border-white/70 bg-white/95 backdrop-blur-sm p-5 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Search Surahs
        </label>

        <div className="mt-2 relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500/70">
            🔍
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Try "Ikhlās", "Raḥmān", or type Arabic…'
            className="
              w-full rounded-full border 
              border-emerald-200 bg-white 
              px-9 py-2.5 text-sm outline-none 
              shadow-sm transition
              focus:border-emerald-400 
              focus:ring-2 focus:ring-emerald-100
            "
          />
        </div>

        <div className="mt-2 text-xs text-slate-600">
          {filtered.length} shown
        </div>
      </div>

      {/* Grid of floating cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/70 bg-white/90 p-6 text-center text-sm text-slate-600 shadow-sm backdrop-blur-sm">
          No surahs found.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <li key={s.slug}>
              <div
                className="
                  group block h-full rounded-3xl 
                  border border-white/80 
                  bg-white/95 backdrop-blur-sm
                  p-5 shadow-sm transition 
                  hover:-translate-y-1 
                  hover:shadow-lg 
                  hover:border-emerald-300
                "
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-400">
                    #{pad3(s.number)}
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    {s.ayahs} āyāt
                  </span>
                </div>

                {/* Arabic + Names */}
                <div className="mt-4 text-center">
                  <div className="text-2xl font-arabic leading-snug tracking-wide text-slate-900">
                    {s.arabic}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-emerald-700/75">
                    {s.slug.replace("-", " ")}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">
                    {s.name}
                  </div>
                </div>

                {/* Optional summary */}
                {s.summary && (
                  <p className="mt-3 line-clamp-2 text-xs text-slate-600">
                    {s.summary}
                  </p>
                )}

                {/* Buttons: Open · Learn · Practice */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2 text-[11px]">
                  <Link
                    href={`/surah/${s.slug}`}
                    onClick={() => rememberSurah(s.slug)}
                    className="flex-1 rounded-full border border-emerald-200 bg-white py-1.5 text-center font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
                  >
                    Open
                  </Link>

                  <Link
                    href={`/guided?slug=${s.slug}`}
                    onClick={() => rememberSurah(s.slug)}
                    className="flex-1 rounded-full border border-emerald-500 bg-emerald-50 py-1.5 text-center font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                  >
                    Learn
                  </Link>

                  <Link
                    href={`/practice?slug=${s.slug}`}
                    onClick={() => rememberSurah(s.slug)}
                    className="flex-1 rounded-full bg-emerald-500 py-1.5 text-center font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    Practice
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function pad3(n: number) {
  return n.toString().padStart(3, "0");
}
