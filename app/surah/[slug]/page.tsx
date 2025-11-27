// app/surah/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { SURAH_MAP, SURAHS, type Surah } from "@/data/surahs";
import { loadSurahExtras } from "@/lib/loaders";
import SurahReader from "./SurahReader";

/* ---------------- helpers ---------------- */

type Params = { slug: string };
type SearchParams = { start?: string; end?: string };

function getSurah(slug: string): Surah | undefined {
  return SURAH_MAP[slug];
}
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function extractVerses(input: unknown): unknown[] {
  let x: unknown = input;

  if (x && typeof x === "object" && "ayahs" in (x as any)) {
    x = (x as any).ayahs;
  }

  if (Array.isArray(x)) return x as unknown[];

  if (x && typeof x === "object") {
    const obj = x as Record<string, unknown>;
    const keys = Object.keys(obj)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b));
    if (keys.length) return keys.map((k) => obj[k]);
    return Object.values(obj);
  }

  return [];
}

/* ---------------- metadata ---------------- */

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const s = getSurah(slug);
  return s
    ? {
        title: `${s.name} — Qur’an Memoriser`,
        description: `Read ${s.name} (${s.arabic}).`,
      }
    : {
        title: "Surah — Not found",
        description: "We couldn’t find that surah.",
      };
}

/* ---------------- page ---------------- */

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const surah = getSurah(slug);
  if (!surah) {
    const known = SURAHS.map((s) => s.slug);
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Surah not found</h1>
        <p className="mt-2 text-gray-700">
          We couldn’t match the slug: <span className="font-mono">{slug}</span>
        </p>
        <p className="mt-4 text-sm text-gray-700">
          Try one of these:&nbsp;
          {known.map((k, i) => (
            <span key={k}>
              <Link className="underline" href={`/surah/${k}`}>
                {k}
              </Link>
              {i < known.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
        <p className="mt-6">
          <Link
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
            href="/surahs"
          >
            Back to all surahs
          </Link>
        </p>
      </main>
    );
  }

  const total = surah.ayat.length;
  let start = Number(sp.start ?? 1);
  let end = Number(sp.end ?? total);
  if (!Number.isFinite(start)) start = 1;
  if (!Number.isFinite(end)) end = total;
  start = clamp(start, 1, total);
  end = clamp(end, 1, total);
  if (start > end) [start, end] = [end, start];

  const selectedAyat = surah.ayat.slice(start - 1, end);

  const { translation, transliteration } = await loadSurahExtras(slug);
  const allTrans = extractVerses(translation);
  const allTranslit = extractVerses(transliteration);

  const selectedTrans = allTrans.slice(start - 1, end);
  const selectedTranslit = allTranslit.slice(start - 1, end);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {surah.name} <span className="text-gray-500">({surah.arabic})</span>
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          #{surah.number} · {surah.ayat.length} āyāt · Showing {start}–{end}
        </p>

        <div className="mt-3 flex gap-2">
          <Link
            href={{
              pathname: "/session",
              query: {
                slug,
                mode: "practice",
                start,
                end,
                hide: "none",
                reps: 1,
              },
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
          >
            Start memorising
          </Link>
          <Link
            href="/surahs"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            Back to all surahs
          </Link>
        </div>
      </div>

            <SurahReader
        start={start}
        ayat={selectedAyat}
        translation={selectedTrans as any[]}
        transliteration={selectedTranslit as any[]}
        surahNumber={surah.number}
        audioSrc={`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surah.number}.mp3`}
      />

    </main>
  );
}
