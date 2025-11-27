// app/HomePageClient.tsx
"use client";

import Link from "next/link";

export default function HomePageClient() {
  return (
    <main className="relative min-h-screen">
      {/* Background stack */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-br from-emerald-400 via-teal-400 to-fuchsia-500" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_15%,rgba(255,255,255,0.45),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.7),rgba(255,255,255,0.95))]" />

      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pt-20 pb-24 sm:pt-24">
        {/* HERO */}
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Left: copy */}
          <div className="lg:text-left text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              Early beta · Private by design
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Memorise with{" "}
              <span className="hero-highlight">focus.</span>
              <br />
              <span className="hero-highlight hero-highlight-delay">
                Review with confidence.
              </span>
            </h1>

            <p className="mt-4 mx-auto max-w-xl text-base text-gray-700 sm:text-lg lg:mx-0">
              A calm space for Qur’an memorisation – with readable Arabic,
              guided drills, and progress tracking that stays on your device.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="/practice"
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
              >
                Start practising
              </Link>
              <Link
                href="/surah/al-ikhlas"
                className="rounded-xl border border-gray-300 bg-white/80 px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              >
                Quick start: Al-Ikhlāṣ
              </Link>
            </div>

            <p className="mt-3 text-xs text-gray-600">
              No account required · No ads · Works in your browser
            </p>

            {/* Small stats row */}
            <dl className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-gray-700 sm:text-sm lg:justify-start">
              <Stat label="Supported surahs" value="All 114" />
              <Stat label="Practice modes" value="Practice · Drill · Recall" />
              <Stat label="Devices" value="Any modern browser" />
            </dl>
          </div>

          {/* Right: preview card */}
          <div className="relative">
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-300/40 blur-3xl" />
            <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-teal-300/40 blur-3xl" />

            <div className="relative rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Reading mode · Ar-Raḥmān
                </span>
                <span>01:23 session</span>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-[radial-gradient(circle_at_top,_#ddf7ef,_#f9fafb)] p-4 shadow-sm">
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-center font-arabic text-2xl text-emerald-800"
                >
                  الرَّحْمٰنُ
                </p>
                <p className="mt-1 text-center text-xs font-medium tracking-[0.25em] text-gray-500 uppercase">
                  Ar-Raḥmān · #55
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  <MiniAyah
                    n={1}
                    arabic="عَلَّمَ الْقُرْآنَ"
                    translation="He taught the Qur’an."
                  />
                  <MiniAyah
                    n={2}
                    arabic="خَلَقَ الإِنسَانَ"
                    translation="He created man."
                  />
                  <MiniAyah
                    n={3}
                    arabic="عَلَّمَهُ الْبَيَانَ"
                    translation="He taught him clear expression."
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-emerald-50">
                    <span className="block h-full w-2/3 rounded-full bg-emerald-500" />
                  </span>
                  <span>Session progress</span>
                </div>
                <button className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-800 shadow-sm hover:bg-gray-50">
                  Open reader
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700">
            Three simple steps to keep your memorisation moving.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Step
              n={1}
              title="Choose a surah"
              desc="Browse by surah and pick the section you want to work on."
            />
            <Step
              n={2}
              title="Practise with focus"
              desc="Hide, reveal, and repeat ayāt using practice or drill mode."
            />
            <Step
              n={3}
              title="Review with tracking"
              desc="See your scores and notes so you know exactly what to review."
            />
          </div>
        </section>

        {/* FEATURES */}
        <section className="space-y-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Built for deep, distraction-free memorisation
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Guided practice"
              desc="Hide or reveal ayāt, practise in chunks, and use repeat loops for tough sections."
            />
            <FeatureCard
              title="Smart drills"
              desc="Randomised prompts, first-letter cues, and spaced repetition to lock in retention."
            />
            <FeatureCard
              title="Privacy-first tracking"
              desc="Per-surah stats and notes that live in your browser – synced only if you choose."
            />
          </div>
        </section>

        {/* CTA BAND */}
        <section>
          <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-slate-900 to-emerald-900 px-6 py-10 text-center text-white shadow sm:px-12 sm:py-12">
            <h3 className="text-2xl font-bold sm:text-3xl">
              Ready for your next review session?
            </h3>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              Jump into Practice mode, explore key ayāt, or open a surah and
              continue from where you left off.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/practice"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
              >
                Begin now
              </Link>
              <Link
                href="/surahs"
                className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Browse surahs
              </Link>
              {/* NEW: Qur’an Essentials link */}
              <Link
                href="/essentials"
                className="rounded-xl border border-emerald-300/70 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
              >
                Qur’an Essentials ayāt
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-4xl">
          <h4 className="text-center text-2xl font-bold text-gray-900">
            Frequently asked questions
          </h4>
          <div className="mt-6 divide-y rounded-3xl border border-white/70 bg-white/90 shadow backdrop-blur">
            <FAQ
              q="Is this free to use?"
              a="Yes. Core features are free. We may add optional extras later, but the essentials for memorisation will stay free."
            />
            <FAQ
              q="Do I need an account?"
              a="No. You can practise and track progress locally. If you sign in later, we’ll sync your stats."
            />
            <FAQ
              q="Is my data private?"
              a="We don’t track your recitation or notes. Your practice data is stored on your device unless you choose to sync."
            />
            <FAQ
              q="Which surahs are supported?"
              a="All surahs are supported. Start from the home page, search, or jump directly to a surah route like /surah/al-ikhlas."
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-4 border-t border-white/70 bg-white/80 text-sm text-gray-700 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
            <div>© {new Date().getFullYear()} Qur’an Memoriser</div>
            <nav className="flex gap-4">
              <Link className="hover:underline" href="/privacy">
                Privacy
              </Link>
              <Link className="hover:underline" href="/about">
                About
              </Link>
              <Link className="hover:underline" href="/contact">
                Contact
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* helpers */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur">
      <span className="text-[11px] font-semibold text-gray-900">{value}</span>
      <span className="text-[11px] text-gray-500">{label}</span>
    </div>
  );
}

function MiniAyah({
  n,
  arabic,
  translation,
}: {
  n: number;
  arabic: string;
  translation: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/70 px-3 py-2 shadow-sm">
      <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">
        {n}
      </span>
      <div className="flex-1 text-right">
        <p dir="rtl" lang="ar" className="font-arabic text-lg text-emerald-800">
          {arabic}
        </p>
        <p className="mt-1 text-[11px] text-gray-600">{translation}</p>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
        {n}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-xs text-gray-700">{desc}</p>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-700">{desc}</p>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group open:bg-white/95 open:backdrop-blur px-5 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-left">
        <span className="font-medium text-gray-900">{q}</span>
        <span className="ml-4 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm text-gray-700">{a}</p>
    </details>
  );
}
