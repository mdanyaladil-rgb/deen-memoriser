// app/practice/page.tsx
import Link from "next/link";
// Support BOTH patterns:
//  - named export:  export const surahs: SurahDef[] = [...]
//  - default export: export default [...]  OR export default { slug: {...}, ... }
import surahsDefault, { surahs as surahsNamed } from "@/data/surahs";

type SurahDef = {
  slug: string;
  name: string;
  arabic?: string;
  number: number;
  ayahs: number;
};

// Normalize whatever was exported into an array
function toArray(data: unknown): SurahDef[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as SurahDef[];
  // map/object case -> values
  return Object.values(data as Record<string, SurahDef>);
}

export const metadata = {
  title: "Practice — Qur’an Memoriser",
  description:
    "Pick a surah and practice options, then jump straight into a focused session.",
};

export default function PracticePage() {
  const list = toArray(surahsNamed ?? surahsDefault);
  const sorted = [...list].sort((a, b) => a.number - b.number);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Practice</h1>
        <p className="mt-1 text-gray-600">
          Choose a surah and set your practice options. We’ll send you to the surah page with your settings applied.
        </p>
      </div>

      {/* Quick starts */}
      <section>
        <h2 className="text-lg font-semibold">Quick starts</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <QuickStart href="/surah/al-ikhlas?mode=practice&start=1&end=4&hide=none" title="Al-Ikhlāṣ (1–4)" />
          <QuickStart href="/surah/al-falaq?mode=practice&start=1&end=5&hide=first-letter" title="Al-Falaq (1–5, 1st-letter)" />
          <QuickStart href="/surah/an-nas?mode=practice&start=1&end=6&hide=word" title="An-Nās (1–6, hide words)" />
        </div>
      </section>

      {/* Builder */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Custom session</h2>
        <form
          action="/practice/redirect"
          method="GET"
          className="mt-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Surah */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Surah</span>
              <select
                name="slug"
                defaultValue={sorted[0]?.slug}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {sorted.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} — #{s.number} ({s.ayahs} āyāt)
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-gray-500">
                Ayah counts shown for reference.
              </span>
            </label>

            {/* Mode */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Mode</span>
              <select
                name="mode"
                defaultValue="practice"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="practice">Practice (step-through)</option>
                <option value="drill">Drill (repeat range)</option>
                <option value="recall">Recall (hide text)</option>
              </select>
            </label>

            {/* Range */}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Start āyah</span>
                <input
                  type="number"
                  name="start"
                  min={1}
                  defaultValue={1}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">End āyah</span>
                <input
                  type="number"
                  name="end"
                  min={1}
                  defaultValue={5}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <p className="col-span-2 text-xs text-gray-500">
                Set within the chosen surah’s range. The surah page can clamp out-of-range values.
              </p>
            </div>

            {/* Hide options */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Hide text</span>
              <select
                name="hide"
                defaultValue="none"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="none">Don’t hide</option>
                <option value="first-letter">First-letter cue</option>
                <option value="word">Hide words</option>
                <option value="full">Hide full ayah</option>
              </select>
            </label>

            {/* Repetitions */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Repetitions</span>
              <input
                type="number"
                name="reps"
                min={1}
                defaultValue={3}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-white font-semibold hover:bg-emerald-700"
            >
              Start session
            </button>
            <Link
              href="/"
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function QuickStart({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
    >
      <div className="text-sm text-gray-600">Start now</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{title}</div>
    </Link>
  );
}
