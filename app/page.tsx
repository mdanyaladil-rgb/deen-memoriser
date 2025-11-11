// app/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Qur’an Memoriser — Recite • Learn • Track",
  description:
    "A beautiful, fast way to memorise Qur’an: practise by ayah, use smart drills, and track progress.",
};

export default function HomePage() {
  return (
    <main className="relative">
      {/* Full-page gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-fuchsia-600" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_20%,rgba(255,255,255,0.35),transparent)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.6),rgba(255,255,255,0.9))]" />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-16 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl sm:text-6xl font-bold tracking-tight text-gray-900">
          Memorise with focus. Review with confidence.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-700">
          Clean design, powerful practice tools, and progress tracking — all
          tailored for Qur’an memorisation.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/practice"
            className="rounded-xl bg-gray-900 px-5 py-3 text-white font-semibold shadow hover:bg-black transition"
          >
            Start practising
          </Link>
          <Link
            href="/surah/al-ikhlas"
            className="rounded-xl border border-gray-300 bg-white/70 backdrop-blur px-5 py-3 font-semibold text-gray-900 hover:bg-white transition"
          >
            Quick start: Al-Ikhlāṣ
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          Private by design · No ads · Free core features
        </div>
      </section>

      {/* INFORMATION SECTION */}
      <section className="mx-auto max-w-7xl px-4 mt-6 sm:mt-10">
        <div className="grid gap-6 lg:grid-cols-2 items-center">
          {/* Text column */}
          <div className="rounded-3xl bg-white/80 backdrop-blur p-6 sm:p-8 shadow border border-white/60">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Built for deep, distraction-free memorisation
            </h2>
            <p className="mt-3 text-gray-700">
              Everything you need to stay in flow: readable Arabic, quick
              navigation, and practice modes that reinforce recall.
            </p>

            <ul className="mt-6 space-y-4">
              <FeatureItem
                title="Guided practice"
                desc="Hide or reveal ayāt, practise in chunks, and use repeat loops for tough sections."
              />
              <FeatureItem
                title="Smart drills"
                desc="Randomised prompts, first-letter cues, and spaced repetition to lock in retention."
              />
              <FeatureItem
                title="Progress tracking"
                desc="Per-surah scores, streaks, and notes — so you always know what to review next."
              />
              <FeatureItem
                title="Privacy-first"
                desc="Runs in your browser with no tracking. Your practice stays on your device."
              />
            </ul>

            <div className="mt-6 flex gap-3">
              <Link
                href="/practice"
                className="rounded-xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Try Practice mode
              </Link>
              <Link
                href="/stats"
                className="rounded-xl border border-gray-300 bg-white/70 backdrop-blur px-5 py-3 font-semibold hover:bg-white transition"
              >
                View progress
              </Link>
            </div>
          </div>

          {/* Visual column */}
          <div className="relative h-80 sm:h-[28rem]">
            <div className="absolute inset-0 rounded-3xl border border-white/60 bg-white/80 backdrop-blur shadow-inner grid place-items-center">
              <div className="text-gray-500">
                (Add an app screenshot / preview here)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="mx-auto max-w-7xl px-4 mt-16 sm:mt-24">
        <div className="rounded-3xl bg-gray-900 text-white p-8 sm:p-12 text-center shadow">
          <h3 className="text-2xl sm:text-3xl font-bold">
            Ready for your next review session?
          </h3>
          <p className="mt-2 text-white/80">
            Jump into Practice mode or open a surah and start drilling.
          </p>
          <div className="mt-6">
            <Link
              href="/practice"
              className="rounded-xl bg-white text-gray-900 font-semibold px-5 py-3 hover:bg-gray-100"
            >
              Begin now
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 mt-16 mb-24">
        <h4 className="text-2xl font-bold text-gray-900 text-center">
          Frequently asked questions
        </h4>
        <div className="mt-6 rounded-3xl bg-white/80 backdrop-blur border border-white/60 shadow divide-y">
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
      <footer className="border-t border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Qur’an Memoriser</div>
          <nav className="flex gap-4">
            <Link className="hover:underline" href="/privacy">Privacy</Link>
            <Link className="hover:underline" href="/about">About</Link>
            <Link className="hover:underline" href="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

/* Helpers */
function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow">
        ✓
      </span>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-700">{desc}</div>
      </div>
    </li>
  );
}
function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group open:bg-white/90 open:backdrop-blur p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-left">
        <span className="font-medium text-gray-900">{q}</span>
        <span className="ml-4 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 group-open:rotate-45 transition">
          +
        </span>
      </summary>
      <p className="mt-3 text-gray-700">{a}</p>
    </details>
  );
}
