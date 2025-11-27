// app/beta-disclaimer/page.tsx

import Link from "next/link";

export const metadata = {
  title: "Beta Disclaimer — Qur’an Memoriser",
};

export default function BetaDisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Top breadcrumb / back link */}
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-emerald-700 hover:text-emerald-900"
        >
          ← Back to home
        </Link>
      </div>

      {/* Card */}
      <section className="rounded-2xl border border-emerald-100 bg-white/80 shadow-sm px-6 sm:px-10 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-lg">
            ⚠️
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Beta Disclaimer
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Qur’an Memoriser is in <span className="font-semibold">public beta</span>.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-800 text-sm sm:text-base">
          <p>
            Qur’an Memoriser is currently in{" "}
            <span className="font-semibold">public beta</span>. This means you’re
            using an early version of the app while it’s still being improved and
            expanded.
          </p>

          {/* What to expect */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              What to expect
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Some features may be incomplete or missing.</li>
              <li>You may experience bugs or unexpected behaviour.</li>
              <li>
                Audio, memorisation modes, and UI polish are still being refined.
              </li>
              <li>New features and tweaks will be added regularly.</li>
            </ul>
          </div>

          {/* How you can help */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              How you can help
            </h2>
            <p className="mb-2">
              Your feedback is extremely valuable at this stage. If you notice:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Incorrect text, translations, or ayah ordering</li>
              <li>Bugs, crashes, or things that feel confusing</li>
              <li>Ideas for new features or ways to improve memorisation</li>
            </ul>

            {/* Feedback CTA */}
            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Share your feedback
                </p>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                  Send any thoughts, ideas, or bug reports — even small ones help.
                </p>
              </div>

              <a
                href="mailto:mdanyaladil@gmail.com?subject=Qur%E2%80%99an%20Memoriser%20Feedback"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
              >
                Email feedback
              </a>
            </div>
          </div>

          <div className="border-t border-emerald-50 pt-4 mt-2">
            <p className="text-sm italic text-gray-700">
              May Allah make this a source of benefit and reward for you and us.
              Ameen.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
