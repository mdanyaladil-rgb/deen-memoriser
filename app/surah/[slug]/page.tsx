// app/surah/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import SurahClient from "./SurahClient";
import { SURAH_MAP, SURAHS, type Surah } from "@/data/surahs";

type SearchParams = {
  mode?: "practice" | "drill" | "recall";
  start?: string;
  end?: string;
  hide?: "none" | "first-letter" | "word" | "full";
  reps?: string;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function getSurah(slug: string): Surah | undefined {
  return SURAH_MAP[slug]; // slugs in your data are exact: an-nas, al-falaq, al-ikhlas, ar-rahman
}

/* ---------- metadata (Next 16: params is a Promise) ---------- */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const s = getSurah(slug);
  return s
    ? {
        title: `${s.name} — Qur’an Memoriser`,
        description: `Practise and review ${s.name} (${s.arabic}).`,
      }
    : {
        title: "Surah — Not found",
        description: "We couldn’t find that surah.",
      };
}

/* ----------------------- Page (single default) ----------------------- */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
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

  // Parse & clamp range
  let start = Number(sp.start ?? 1);
  let end = Number(sp.end ?? total);
  if (!Number.isFinite(start)) start = 1;
  if (!Number.isFinite(end)) end = total;
  start = clamp(start, 1, total);
  end = clamp(end, 1, total);
  if (start > end) [start, end] = [end, start];

  const mode = (sp.mode ?? "practice") as NonNullable<SearchParams["mode"]>;
  const hide = (sp.hide ?? "none") as NonNullable<SearchParams["hide"]>;
  const reps = Math.max(1, Math.min(99, Number(sp.reps ?? 3)));

  const selectedAyat = surah.ayat.slice(start - 1, end);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {surah.name} <span className="text-gray-500">({surah.arabic})</span>
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          #{surah.number} · {surah.ayat.length} āyāt · Showing {start}–{end}
          {mode === "drill" ? ` · ${reps} reps` : ""}
        </p>
      </div>

      <SurahClient
        slug={surah.slug}
        name={surah.name}
        arabic={surah.arabic}
        number={surah.number}
        totalAyat={total}
        ayat={selectedAyat}
        range={{ start, end }}
        options={{ mode, hide, reps }}
      />
    </main>
  );
}
