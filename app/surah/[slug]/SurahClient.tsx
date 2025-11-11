// app/surah/[slug]/SurahClient.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Mode = "practice" | "drill" | "recall";
type Hide = "none" | "first-letter" | "word" | "full";

export default function SurahClient(props: {
  slug: string;
  name: string;
  arabic: string;
  number: number;
  totalAyat: number;
  ayat: string[];               // already sliced by server
  range: { start: number; end: number };
  options: { mode: Mode; hide: Hide; reps: number };
}) {
  const [mode, setMode] = useState<Mode>(props.options.mode);
  const [hide, setHide] = useState<Hide>(props.options.hide);
  const [reps, setReps] = useState<number>(props.options.reps);

  const processed = useMemo(
    () => props.ayat.map((a) => maskAyah(a, hide)),
    [props.ayat, hide]
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="practice">Practice (step-through)</option>
              <option value="drill">Drill (repeat range)</option>
              <option value="recall">Recall (hide text)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Hide text</span>
            <select
              value={hide}
              onChange={(e) => setHide(e.target.value as Hide)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="none">Don’t hide</option>
              <option value="first-letter">First-letter cue</option>
              <option value="word">Hide words</option>
              <option value="full">Hide full āyah</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Repetitions</span>
            <input
              type="number"
              min={1}
              max={99}
              value={reps}
              onChange={(e) => setReps(Number(e.target.value || 1))}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Range: {props.range.start}–{props.range.end} of {props.totalAyat} ·{" "}
          <Link
            className="underline"
            href={`/practice?slug=${props.slug}`}
          >
            change range
          </Link>
        </div>
      </div>

      {/* Ayat list */}
      <ol
        start={props.range.start}
        className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        {processed.map((text, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow">
              {props.range.start + i}
            </span>
            <p className="font-arabic text-xl leading-relaxed">{text}</p>
          </li>
        ))}
      </ol>

      {/* Action area */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/surah/${props.slug}?mode=${mode}&start=${props.range.start}&end=${props.range.end}&hide=${hide}&reps=${reps}`}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-white font-semibold hover:bg-emerald-700"
        >
          Apply settings
        </Link>
        <Link
          href="/practice"
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold hover:bg-gray-50"
        >
          Back to Practice
        </Link>
      </div>
    </div>
  );
}

/* ------------------- helpers ------------------- */

// Hide modes:
// - "none": original
// - "first-letter": keep first letter of each word, replace rest with dots
// - "word": replace whole words with "—"
// - "full": replace the whole ayah
function maskAyah(ayah: string, hide: Hide): string {
  if (hide === "none") return ayah;
  if (hide === "full") return "••••••••••••";
  if (hide === "word") return ayah.split(/\s+/).map(() => "—").join(" ");
  // first-letter
  return ayah
    .split(/\s+/)
    .map((w) => (w.length ? w[0] + "…" : w))
    .join(" ");
}
