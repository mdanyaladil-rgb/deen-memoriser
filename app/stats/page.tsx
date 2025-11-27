"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  loadSessions,
  calcStreakDays,
  calcSessionsThisWeek,
  calcAverageOfLastN,
  groupBySurah,
  fmtDate,
  fmtPercent,
  type SessionResult,
  isRecallSession,
} from "@/lib/progress";

type WeekSummary = {
  counts: number[]; // last 7 days, oldest -> newest
};

function buildWeekSummary(sessions: SessionResult[]): WeekSummary {
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const counts = Array(7).fill(0);

  sessions.forEach((s) => {
    const d = new Date(s.at);
    const dMid = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffMs = todayMid.getTime() - dMid.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays < 7) {
      const index = 6 - diffDays; // oldest at 0, newest at 6
      counts[index] += 1;
    }
  });

  return { counts };
}

function asPercentNumber(x: number | null | undefined): number {
  if (x == null) return 0;
  return x <= 1 ? x * 100 : x;
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

// build recall timeline: average percent per day, last 20 days
function buildRecallTimeline(sessions: SessionResult[]) {
  const recall = sessions.filter(isRecallSession);
  if (!recall.length) return [];

  const byDay = new Map<number, number[]>();
  for (const s of recall) {
    const d = new Date(s.at);
    const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const arr = byDay.get(dayKey) ?? [];
    arr.push(s.percent);
    byDay.set(dayKey, arr);
  }

  const entries = Array.from(byDay.entries()).sort((a, b) => a[0] - b[0]);
  const points = entries.map(([day, vals]) => ({
    day,
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
  }));

  const MAX = 20;
  return points.slice(-MAX);
}

function fmtShortDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function StatsPage() {
  const [sessions, setSessions] = useState<SessionResult[] | null>(null);

  useEffect(() => {
    (async () => {
      const s = await loadSessions();
      setSessions(s);
    })();
  }, []);

  const loading = sessions === null;
  const safeSessions: SessionResult[] = sessions ?? [];

  const streak = calcStreakDays(safeSessions);
  const thisWeek = calcSessionsThisWeek(safeSessions);
  const avgLast10Raw = calcAverageOfLastN(safeSessions, 10);
  const avgLast10Percent =
    avgLast10Raw == null ? null : asPercentNumber(avgLast10Raw);
  const recent = [...safeSessions].slice(-5).reverse();
  const perSurah = Object.values(groupBySurah(safeSessions)).sort(
    (a: any, b: any) => a.number - b.number
  );
  const weekSummary = buildWeekSummary(safeSessions);

  const hasAnyData =
    safeSessions.length > 0 ||
    streak > 0 ||
    thisWeek > 0 ||
    (avgLast10Percent ?? 0) > 0 ||
    recent.length > 0 ||
    perSurah.length > 0;

  // NEW: focus breakdown (Arabic vs Transliteration vs unknown)
  const focusStats = useMemo(() => {
    const counts = { arabic: 0, translit: 0, unknown: 0 };
    for (const s of safeSessions) {
      const f = s.focus;
      if (f === "arabic") counts.arabic++;
      else if (f === "translit") counts.translit++;
      else counts.unknown++;
    }
    const total =
      counts.arabic + counts.translit + counts.unknown || 1;
    return {
      counts,
      total,
      pctArabic: Math.round((counts.arabic / total) * 100),
      pctTranslit: Math.round((counts.translit / total) * 100),
      pctUnknown: Math.round((counts.unknown / total) * 100),
    };
  }, [safeSessions]);

  // NEW: recall timeline
  const timeline = useMemo(
    () => buildRecallTimeline(safeSessions),
    [safeSessions]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Your Progress
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your memorisation streak, recall strength, and surah-by-surah journey.
          </p>
          {loading && (
            <p className="mt-1 text-xs text-slate-400">
              Loading latest sessions…
            </p>
          )}
        </div>

        <Link
          href="/practice"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow shadow-emerald-200 transition hover:bg-emerald-700 hover:shadow-md"
        >
          Practice now
          <span className="text-lg leading-none">↻</span>
        </Link>
      </div>

      {/* Top stats cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {/* Streak card with 7-day tracker */}
        <div className="group rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm shadow-emerald-50 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
              Current streak
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              <span>🔥</span> Daily
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">
              {streak || "—"}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {streak === 1 ? "day" : "days"}
            </span>
          </div>

          {/* 7-day activity dots using real data */}
          <div className="mt-4 flex items-center justify-between">
            {weekSummary.counts.map((count, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`h-2 w-2 rounded-full transition ${
                    count > 0
                      ? "bg-emerald-500 shadow shadow-emerald-300"
                      : "bg-slate-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Do at least one short session each day to keep your streak alive.
          </p>
        </div>

        {/* Sessions this week card with mini bar chart */}
        <div className="group rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              Sessions this week
            </p>
            <span className="text-[11px] text-slate-400">Target: 7 sessions</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">
              {thisWeek || "—"}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              sessions
            </span>
          </div>

          {/* tiny bar chart = real counts for last 7 days */}
          <div className="mt-4 flex h-12 items-end gap-1.5">
            {weekSummary.counts.map((count, i) => {
              const max = Math.max(1, ...weekSummary.counts);
              const heightPct = 30 + (count / max) * 60; // 30–90%
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-slate-100"
                  style={{ height: `${heightPct}%` }}
                >
                  <div
                    className={`h-full w-full rounded-full transition ${
                      count > 0 ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Consistent, small sessions are better than rare long ones.
          </p>
        </div>

        {/* Average recall score card with circular visual */}
        <div className="group rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              Avg. recall score
            </p>
            <span className="text-[11px] text-slate-400">last 10 drills</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 opacity-70" />
              <div className="absolute inset-1 rounded-full bg-white" />
              <div className="relative flex h-full w-full items-center justify-center">
                <span className="text-lg font-semibold text-slate-900">
                  {avgLast10Percent != null ? Math.round(avgLast10Percent) : "—"}
                </span>
                <span className="text-xs text-slate-500 ml-0.5">%</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <ProgressBar value={avgLast10Percent ?? 0} />
              <p className="text-[11px] text-slate-500">
                Try to keep this above{" "}
                <span className="font-semibold text-emerald-600">80%</span> for
                sections you&apos;ve already memorised.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Session style breakdown + recall timeline */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Session style breakdown */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              How you practise
            </p>
            <span className="text-[11px] text-slate-400">
              {focusStats.counts.arabic +
                focusStats.counts.translit +
                focusStats.counts.unknown}{" "}
              sessions
            </span>
          </div>

          <div className="mt-2 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Arabic focus
                </span>
                <span className="text-slate-500">{focusStats.pctArabic}%</span>
              </div>
              <ProgressBar value={focusStats.pctArabic} />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Transliteration focus
                </span>
                <span className="text-slate-500">{focusStats.pctTranslit}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-[width] duration-500 ease-out"
                  style={{ width: `${focusStats.pctTranslit}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Unlabelled / older sessions
                </span>
                <span className="text-slate-500">{focusStats.pctUnknown}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-400 transition-[width] duration-500 ease-out"
                  style={{ width: `${focusStats.pctUnknown}%` }}
                />
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            As you do more sessions, this shows whether you&apos;re mostly
            memorising directly in Arabic or leaning on transliteration.
          </p>
        </div>

        {/* Recall progress over time */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              Recall progress over time
            </p>
            <span className="text-[11px] text-slate-400">
              {timeline.length ? `${timeline.length} days` : "No recall data yet"}
            </span>
          </div>

          {timeline.length === 0 ? (
            <p className="text-sm text-slate-500">
              Once you complete a few scored sessions, you&apos;ll see how your recall
              is trending over time.
            </p>
          ) : (
            <>
              <div className="mt-2 flex h-24 items-end gap-1.5">
                {timeline.map((pt, idx) => {
                  const heightPct = 20 + (pt.avg / 100) * 80; // keep bars visible
                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-md bg-emerald-500/80"
                      style={{ height: `${heightPct}%` }}
                      title={`${Math.round(pt.avg)}% on ${fmtShortDate(
                        pt.day
                      )}`}
                    />
                  );
                })}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                <span>{fmtShortDate(timeline[0].day)}</span>
                <span>{fmtShortDate(timeline[timeline.length - 1].day)}</span>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Each bar is the average recall score for that day. Aim for a gentle
                upward trend over the weeks.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
        <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
          {recent.length === 0 ? (
            <p className="text-sm text-gray-600">
              No activity yet. Do a quick session in{" "}
              <Link
                className="font-medium text-emerald-700 underline underline-offset-4"
                href="/practice"
              >
                Practice
              </Link>{" "}
              to see it here.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="py-3 flex items-center justify-between gap-4 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-slate-900">
                      <span className="font-medium">{s.name}</span>{" "}
                      <span className="text-slate-500">
                        · āyāt {s.range.start}–{s.range.end} · {s.mode}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">{fmtDate(s.at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Score</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {fmtPercent(s.percent)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Per-surah progress */}
      <section className="space-y-3 pb-8">
        <h2 className="text-lg font-semibold text-slate-900">Per-surah progress</h2>

        {perSurah.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-600">
            No data yet. Once you practise specific surahs, they&apos;ll appear here with
            their latest score and last practised date.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm">
            <div className="grid grid-cols-[2fr,1.4fr,1.2fr,auto] gap-4 border-b border-slate-100 bg-slate-50/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Surah</span>
              <span>Last score</span>
              <span>Last practised</span>
              <span />
            </div>
            <div className="divide-y divide-slate-100">
              {perSurah.map((row: any) => {
                const lastScorePercent = asPercentNumber(row.lastScore);
                return (
                  <div
                    key={row.slug}
                    className="grid grid-cols-[2fr,1.4fr,1.2fr,auto] items-center gap-4 px-4 py-3 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {row.name}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {row.lastScore != null ? (
                        <>
                          <ProgressBar value={lastScorePercent} />
                          <span className="text-[11px] text-slate-500">
                            {fmtPercent(row.lastScore)} recall
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          No score yet
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {row.lastAt ? fmtDate(row.lastAt) : "—"}
                    </div>

                    <div className="text-right">
                      <Link
                        href={`/session?slug=${row.slug}`}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {!hasAnyData && !loading && (
        <p className="pb-4 text-center text-xs text-slate-400">
          Start a practice session to bring this page to life ✨
        </p>
      )}
    </main>
  );
}
