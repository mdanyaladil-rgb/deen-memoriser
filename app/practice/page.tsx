// app/practice/page.tsx
import Link from "next/link";
import surahsDefault, { surahs as surahsNamed } from "@/data/surahs";

type SurahDef = {
  slug: string;
  name: string;
  arabic?: string;
  number: number;
  ayahs: number;
};

function toArray(data: unknown): SurahDef[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as SurahDef[];
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
    <main className="relative min-h-screen">
      {/* same layered background as homepage */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-br from-emerald-400 via-teal-400 to-fuchsia-500" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_15%,rgba(255,255,255,0.45),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.7),rgba(255,255,255,0.95))]" />

      <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:pt-24">
        {/* Header */}
        <header className="mb-8 space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Practice · Drill · Recall
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Practice
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-gray-700">
            Choose a surah, range, and difficulty. We&apos;ll send you straight
            into a focused memorisation session with your settings applied.
          </p>
        </header>

        {/* Quick starts */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
            Quick starts
          </h2>
          <p className="text-xs text-gray-600">
            Jump straight into some popular, short surahs with sensible defaults.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickStart
              href="/session?slug=al-ikhlas&mode=practice&start=1&end=4&hide=none&reps=3"
              title="Al-Ikhlāṣ (1–4)"
              desc="Short surah · all text visible"
            />
            <QuickStart
              href="/session?slug=al-falaq&mode=practice&start=1&end=5&hide=first-word&reps=3"
              title="Al-Falaq (1–5, first word)"
              desc="Hide all but the first word of each āyah"
            />
            <QuickStart
              href="/session?slug=an-nas&mode=practice&start=1&end=6&hide=half&reps=3"
              title="An-Nās (1–6, 50% hidden)"
              desc="Easier recall · half the words blurred"
            />
            <QuickStart
              href="/guided?slug=an-nas"
              title="Guided: An-Nās"
              desc="Step-by-step recommended memorisation routine"
            />
          </div>
        </section>
{/* How to use practice effectively */}
<section className="mt-10 space-y-3">
  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
    How to get the most from practice
  </h2>
  <p className="text-xs text-gray-600 max-w-xl">
    A simple routine to make your memorisation consistent and light, in shā’ Allāh.
  </p>

  <div className="grid gap-4 md:grid-cols-3">
    {/* Card 1 */}
    <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
      {/* soft background shape */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-50" />
      <div className="relative">
        <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
          1
        </div>
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px]">
            📖
          </span>
          Start small
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Pick a short surah or just 3–5 āyāt. Repeat them for a few days instead
          of trying to memorise a big page at once.
        </p>

        {/* mini visual: small mushaf card */}
        <div className="mt-3 rounded-xl border border-emerald-50 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-2">
          <div className="flex items-center justify-between text-[10px] text-gray-600">
            <span className="rounded-full bg-white px-2 py-0.5 font-medium text-emerald-700">
              3–5 āyāt
            </span>
            <span className="h-1.5 w-16 rounded-full bg-emerald-200" />
          </div>
          <div className="mt-2 h-8 rounded-md bg-white/90 shadow-inner" />
        </div>
      </div>
    </div>

    {/* Card 2 */}
    <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-teal-50" />
      <div className="relative">
        <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
          2
        </div>
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px]">
            🎯
          </span>
          Increase difficulty
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Start with <span className="font-medium">Don&apos;t hide</span>, then move
          to <span className="font-medium">50% hidden</span>, and finally{" "}
          <span className="font-medium">Hide words / full āyah</span> when you feel confident.
        </p>

        {/* mini visual: difficulty ladder */}
        <div className="mt-3 flex items-center gap-2 text-[10px]">
          <div className="flex-1 rounded-lg bg-emerald-50 p-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-emerald-800">Difficulty</span>
              <span className="text-emerald-700/80">Step up →</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              <span className="rounded-full bg-white px-2 py-0.5 text-center">
                None
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-center">
                50%
              </span>
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-center">
                Words
              </span>
              <span className="rounded-full bg-emerald-300 px-2 py-0.5 text-center">
                Full
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Card 3 */}
    <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
      <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-emerald-50" />
      <div className="relative">
        <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
          3
        </div>
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px]">
            🔁
          </span>
          Repeat & review
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Use <span className="font-medium">3–5 repetitions</span> for new āyāt. The
          next day, quickly review yesterday&apos;s range once before adding new lines.
        </p>

        {/* mini visual: day 1 / day 2 timeline */}
        <div className="mt-3 rounded-xl bg-emerald-50/60 p-2 text-[10px] text-emerald-900">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">Day 1</span>
            <span className="ml-auto rounded-full bg-white px-2 py-0.5">
              New āyāt ×3
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-semibold">Day 2</span>
            <span className="ml-auto rounded-full bg-white px-2 py-0.5">
              Review → then add
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

        {/* Custom session */}
        <section className="mt-10 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
            Custom session
          </h2>

          <form
            action="/session"
            method="GET"
            className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm sm:p-8"
          >
            {/* subtle top ornament / gradient strip */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            {/* bismillah + intro */}
            <div className="mb-6 space-y-2 pt-2 text-center">
              <div className="font-arabic text-lg text-emerald-800">
                ﷽
              </div>
              <p className="text-xs text-gray-600">
                Fine-tune your session: pick a surah, āyah range, difficulty and
                how many times to repeat.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Surah */}
              <label className="sm:col-span-2 block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Surah
                </span>
                <select
                  name="slug"
                  defaultValue={sorted[0]?.slug}
                  className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2.5 text-sm outline-none shadow-[0_0_0_1px_rgba(16,185,129,0.03)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  {sorted.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} — #{s.number} ({s.ayahs} āyāt)
                    </option>
                  ))}
                </select>
                <span className="block text-[11px] text-gray-500">
                  Āyah counts shown for reference.
                </span>
              </label>

              {/* Range */}
              <div className="sm:col-span-2 space-y-2 rounded-2xl bg-emerald-50/40 p-4 ring-1 ring-emerald-100">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                    Āyah range
                  </span>
                  <span className="text-[11px] text-emerald-700/80">
                    Set within the chosen surah&apos;s range.
                  </span>
                </div>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-gray-800">
                      Start āyah
                    </span>
                    <input
                      type="number"
                      name="start"
                      min={1}
                      defaultValue={1}
                      className="w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-gray-800">
                      End āyah
                    </span>
                    <input
                      type="number"
                      name="end"
                      min={1}
                      defaultValue={5}
                      className="w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                </div>
                <p className="mt-1 text-[11px] text-emerald-800/80">
                  The session will automatically clamp any values that fall
                  outside the surah.
                </p>
              </div>

              {/* Hide options */}
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Difficulty
                </span>
                <select
                  name="hide"
                  defaultValue="none"
                  className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2.5 text-sm outline-none shadow-[0_0_0_1px_rgba(16,185,129,0.03)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="none">Don&apos;t hide (reading)</option>
                  <option value="half">50% hidden (gentle recall)</option>
                  <option value="first-word">First-word cue</option>
                  <option value="word">Hide words (strong)</option>
                  <option value="full">Hide full āyah (exam)</option>
                </select>
                <span className="block text-[11px] text-gray-500">
                  Higher difficulty hides more of each āyah.
                </span>
              </label>

              {/* Repetitions */}
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Repetitions
                </span>
                <input
                  type="number"
                  name="reps"
                  min={1}
                  defaultValue={3}
                  className="mt-1 w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2.5 text-sm outline-none shadow-[0_0_0_1px_rgba(16,185,129,0.03)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <span className="block text-[11px] text-gray-500">
                  Each āyah in the range will be shown this many times.
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
  {/* Normal text-based session */}
  <button
    type="submit"
    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
  >
    Start session
  </button>

  {/* Audio memorisation session – same form fields, different target */}
  <button
    type="submit"
    formAction="/audio-session"
    className="rounded-xl border border-emerald-600 px-6 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
  >
    Start audio session
  </button>

  <Link
    href="/"
    className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
  >
    Cancel
  </Link>
</div>

          </form>
        </section>
      </div>
    </main>
  );
}

function QuickStart({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-3xl border border-white/80 bg-white/90 p-4 text-left shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-300"
    >
      <div>
        <div className="text-xs font-medium text-emerald-700">Start now</div>
        <div className="mt-1 text-sm font-semibold text-gray-900">{title}</div>
        <div className="mt-1 text-xs text-gray-600">{desc}</div>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-emerald-700">
        <span className="font-medium">Open session</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5">1 tap</span>
      </div>
    </Link>
  );
}
