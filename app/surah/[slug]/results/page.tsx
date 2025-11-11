'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

// If the alias fails in your setup, switch these to relative imports:
//   import { auth, db } from "../../../../lib/firebase";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";

type AyahStat = { hidden: number; revealed: number };
type Attempt = {
  at: string;                // ISO string
  ayat?: number;
  stats?: AyahStat[];
  totalPossible?: number;
  totalScore?: number;
  percent: number;           // 0..1
};

export default function SurahResults() {
  const { slug } = useParams<{ slug: string }>();
  const [user] = useAuthState(auth);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Load attempts for this slug: Firestore → localStorage fallback
  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // Try Firestore history first
        if (user) {
          const qRef = query(
            collection(db, "userResults", user.uid, slug),
            orderBy("atServer", "desc"),
            limit(50)
          );
          const snap = await getDocs(qRef);
          const list: Attempt[] = snap.docs.map((d) => {
            const data: any = d.data();
            return {
              at: data.at ?? new Date().toISOString(),
              ayat: data.ayat,
              stats: data.stats,
              totalPossible: data.totalPossible,
              totalScore: data.totalScore,
              percent: typeof data.percent === "number" ? data.percent : 0,
            };
          });
          if (list.length) {
            setAttempts(list);
            setLoading(false);
            return;
          }
        }

        // Fallback: local history
        const local = localStorage.getItem(`${slug}-history`);
        setAttempts(local ? (JSON.parse(local) as Attempt[]) : []);
      } catch (e) {
        console.error("Results load error:", e);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, slug]);

  const latest = attempts?.[0];
  const latestPct = useMemo(
    () => (latest ? Math.round((latest.percent || 0) * 100) : 0),
    [latest]
  );

  // For the mini chart (last up to 12 attempts, oldest → newest)
  const chartValues = useMemo(() => {
    if (!attempts) return [];
    const last = [...attempts].slice(0, 12).reverse();
    return last.map((a) => Math.round((a.percent || 0) * 100));
  }, [attempts]);

  if (loading) return <p className="p-6 text-center">Loading results…</p>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href={`/surah/${slug}`} className="underline">← Back to Surah</Link>
        <Link href="/surahs" className="underline">Surah list</Link>
      </div>

      <h1 className="mt-2 text-center text-3xl font-bold text-green-700">
        Results — {String(slug)}
      </h1>

      {!attempts || attempts.length === 0 ? (
        <p className="mt-6 text-center text-sm text-gray-600">
          No attempts yet. Go back and run a test.
        </p>
      ) : (
        <>
          {/* Latest summary */}
          <div className="mt-4 rounded-2xl bg-white/70 p-6 shadow">
            <div className="text-center text-xl">
              Latest:&nbsp;
              <span className="font-bold text-green-700">
                {latest?.totalScore ?? "-"} / {latest?.totalPossible ?? "-"}
              </span>{" "}
              ({latestPct}%)
            </div>

            {/* Percent bar */}
            <div className="mt-3">
              <div className="h-3 w-full overflow-hidden rounded-full bg-green-200">
                <div className="h-full bg-green-600 transition-all" style={{ width: `${latestPct}%` }} />
              </div>
              <p className="mt-1 text-center text-xs text-gray-600">
                Percentage = Σ(hidden − revealed) / Σ(hidden)
              </p>
            </div>

            {/* Mini chart */}
            <div className="mt-6">
              <p className="mb-2 text-center text-sm text-gray-700">
                Last {chartValues.length} attempts
              </p>
              <div className="flex h-24 items-end justify-center gap-1">
                {chartValues.map((pct, i) => (
                  <div
                    key={i}
                    className="w-4 rounded-t bg-green-600"
                    style={{ height: `${pct}%` }}
                    title={`${pct}%`}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                <span>Oldest</span>
                <span>Newest</span>
              </div>
            </div>
          </div>

          {/* Attempts table */}
          <div className="mt-6 rounded-2xl bg-white/70 p-6 shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-600">
                    <th className="py-2">#</th>
                    <th className="py-2">When</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">% </th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="py-2">{attempts.length - idx}</td>
                      <td className="py-2">{new Date(a.at).toLocaleString()}</td>
                      <td className="py-2">
                        {a.totalScore ?? "-"} / {a.totalPossible ?? "-"}
                      </td>
                      <td className="py-2">{Math.round((a.percent || 0) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/surah/${slug}`}
                className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Retry Test
              </Link>
              <button
                onClick={() => { if (slug) localStorage.removeItem(`${slug}-history`); location.reload(); }}
                className="rounded-xl bg-gray-200 px-4 py-2 hover:bg-gray-300"
              >
                Clear Local History
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
