// app/surahs/page.tsx
import type { Metadata } from "next";
import { SURAHS } from "@/data/surahs";
import SurahBrowser from "@/components/SurahBrowser";

export const metadata: Metadata = {
  title: "Browse Surahs — Qur’an Memoriser",
  description: "Search and browse surahs to recite, memorise, and practise.",
};

export default function Page() {
  const items = SURAHS.map((s) => ({
    slug: s.slug,
    name: s.name,
    arabic: s.arabic,
    number: s.number,
    ayahs: s.ayat.length,
    summary: (s as any).summary,
  }));

  return (
    <main className="relative min-h-screen">
      {/* 🔁 SAME background layers from HomePageClient */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-br from-emerald-400 via-teal-400 to-fuchsia-500" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_15%,rgba(255,255,255,0.45),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.7),rgba(255,255,255,0.95))]" />

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-24">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Browse Surahs
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-xl">
          Search, filter, and jump into a surah to recite or memorise.
        </p>

        {/* 🔥 No boxes. No wrappers. Just floating components. */}
        <div className="mt-10">
          <SurahBrowser items={items} />
        </div>
      </div>
    </main>
  );
}
