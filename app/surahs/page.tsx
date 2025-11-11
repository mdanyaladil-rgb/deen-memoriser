// app/surahs/page.tsx
import { surahs } from "@/data/surahs";
import SurahBrowser from "@/components/SurahBrowser";

export const metadata = {
  title: "All Surahs — Qur’an Memoriser",
  description:
    "Browse all surahs, search by name or Arabic, and jump into practice.",
};

export default function Page() {
  const sorted = [...surahs].sort((a, b) => a.number - b.number);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">All Surahs</h1>
        <p className="mt-1 text-gray-600">
          Search by name or Arabic and open a surah to start practising.
        </p>
      </div>
      <SurahBrowser items={sorted} />
    </main>
  );
}
