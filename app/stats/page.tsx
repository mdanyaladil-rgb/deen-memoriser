// app/stats/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Your Progress — Qur’an Memoriser",
  description: "See your streaks, recent practice, and per-surah progress.",
};

// NOTE: no "use client" needed here (we're not using hooks).
// Default export MUST be a React component that returns JSX.
export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Progress</h1>
        <Link
          href="/practice"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
        >
          Practice now
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Current streak" value="— days" hint="(hook this up later)" />
        <Card title="Sessions this week" value="—" hint="recent practice count" />
        <Card title="Avg. recall score" value="—%" hint="last 10 drills" />
      </div>

      {/* Recent activity */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-600">
          No activity yet. Do a quick session in{" "}
          <Link href="/practice" className="underline">Practice</Link> to see it here.
        </div>
      </section>

      {/* Per-surah table */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Per-surah progress</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Surah</th>
                <th className="px-4 py-3">Last score</th>
                <th className="px-4 py-3">Last practiced</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 text-gray-900">Al-Ikhlāṣ</td>
                <td className="px-4 py-3 text-gray-700">—%</td>
                <td className="px-4 py-3 text-gray-700">—</td>
                <td className="px-4 py-3">
                  <Link href="/surah/al-ikhlas" className="rounded-lg border px-3 py-1 hover:bg-gray-50">
                    Continue
                  </Link>
                </td>
              </tr>
              {/* add real rows later */}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}
