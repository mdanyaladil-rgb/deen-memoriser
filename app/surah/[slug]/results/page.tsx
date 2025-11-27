"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth, db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";

// 🔑 we’ll bridge results → stats here
import { saveSession, uid, type SessionResult } from "@/lib/progress";
import { SURAH_MAP } from "@/data/surahs";

type AyahStat = { hidden: number; revealed: number };

type Attempt = {
  at: string; // ISO string
  ayat?: number;
  stats?: AyahStat[];
  totalPossible?: number;
  totalScore?: number;
  percent: number; // 0..1
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
        const local = typeof window !== "undefined"
          ? localStorage.getItem(`${slug}-history`)
          : null;
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

  // 🔗 BRIDGE: sync latest Attempt → global SessionResult (once per attempt)
  useEffect(() => {
    if (!attempts || !attempts.length || !slug) return;
    const latestAttempt = attempts[0];

    if (typeof window === "undefined") return;

    const key = `qm:last-synced-${slug}`;
    const lastSyncedAt = localStorage.getItem(key);
    if (lastSyncedAt === latestAttempt.at) {
      // Already synced this attempt to /stats
      return;
    }

    try {
      // Look up basic surah meta
      const meta = (SURAH_MAP as any)[slug] ?? {};
      const surahName: string = meta.name ?? String(slug);
      const surahNumber: number = meta.number ?? 0;
      const ayahs: number =
        meta.ayahs ??
        latestAttempt.ayat ??
        (Array.isArray(latestAttempt.stats) ? latestAttempt.stats.length : 1);

      const totalPossible =
        latestAttempt.totalPossible ??
        (Array.isArray(latestAttempt.stats)
          ? latestAttempt.stats.reduce(
              (sum, st) => sum + (st.hidden ?? 0),
              0
            )
          : 0);

      const totalScore =
        latestAttempt.totalScore ??
        (totalPossible > 0
          ? Math.round((latestAttempt.percent || 0) * totalPossible)
          : 0);

      const percent =
        totalPossible > 0
          ? Math.round((totalScore / totalPossible) * 100)
          : Math.round((latestAttempt.percent || 0) * 100);

      const attemptsBool: boolean[] = Array.isArray(latestAttempt.stats)
        ? latestAttempt.stats.map((st) => {
            const hidden = st.hidden ?? 0;
            const revealed = st.revealed ?? 0;
            // crude: treat "all hidden and not revealed" as correctly recalled
            return hidden > 0 && revealed === 0;
          })
        : [];

      const session: SessionResult = {
        id: uid(),
        at: new Date(latestAttempt.at).getTime(),
        slug: String(slug),
        name: surahName,
        number: surahNumber,
        range: { start: 1, end: ayahs || 1 },
        reps: 1,
        mode: "recall", // this is a proper recall test
        correct: totalScore,
        total: totalPossible,
        percent: Number.isFinite(percent) ? percent : 0,
        attempts: attemptsBool,
      };

      // Fire-and-forget: this feeds the /stats page
      saveSession(session).catch((e) =>
        console.error("Failed to sync attempt to sessions:", e)
      );

      localStorage.setItem(key, latestAttempt.at);
    } catch (e) {
      console.error("Error while syncing results to stats:", e);
    }
  }, [attempts, slug]);

  if (loading) return <p className="p-6 text-center">Loading results…</p>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href={`/surah/${slug}`} className="underline">
          ← Back to Surah
        </Link>
        <Link href="/surahs" className="underline">
          Surah list
        </Link>
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
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${latestPct}%` }}
                />
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
                      <td className="py-2">
                        {new Date(a.at).toLocaleString()}
                      </td>
                      <td className="py-2">
                        {a.totalScore ?? "-"} / {a.totalPossible ?? "-"}
                      </td>
                      <td className="py-2">
                        {Math.round((a.percent || 0) * 100)}%
                      </td>
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
                onClick={() => {
                  if (slug && typeof window !== "undefined") {
                    localStorage.removeItem(`${slug}-history`);
                    localStorage.removeItem(`qm:last-synced-${slug}`);
                  }
                  location.reload();
                }}
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
