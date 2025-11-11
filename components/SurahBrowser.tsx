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

  return (
    <div>
      {/* Search */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700">
          Search
        </label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “Ikhlas”, “Rahman”, or type Arabic…"
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="mt-2 text-xs text-gray-500">{filtered.length} shown</div>
      </div>

      {/* Grid */}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/surah/${s.slug}`}
              className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
              onClick={() => {
                try {
                  localStorage.setItem("last_surah_slug", s.slug);
                } catch {}
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-gray-500">#{pad3(s.number)}</div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                  {s.ayahs} āyāt
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <div className="text-base font-semibold">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.slug}</div>
                </div>
                <div className="text-xl font-arabic tracking-wide transition group-hover:scale-[1.03]">
                  {s.arabic}
                </div>
              </div>
              {s.summary && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{s.summary}</p>
              )}
              <div className="mt-3 flex gap-2">
                <span className="rounded-lg border px-2.5 py-1 text-xs text-gray-700">
                  Open
                </span>
                <span className="rounded-lg border px-2.5 py-1 text-xs text-gray-700">
                  Practice
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function pad3(n: number) {
  return n.toString().padStart(3, "0");
}
