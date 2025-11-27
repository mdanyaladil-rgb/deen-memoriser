// app/session/SessionClient.tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";

type Mode = "practice" | "drill" | "recall";
type Hide = "none" | "first-word" | "word" | "full";

export default function SessionClient(props: {
  slug: string;
  name: string;
  arabic: string;
  number: number; // surah number 1–114
  ayat: string[];
  translation: string[];
  transliteration: string[];
  range: { start: number; end: number }; // 1-based āyah numbers
  options: { mode: Mode; hide: Hide; reps: number };
  /** Enable per-ayah audio drill (from query ?audio=1) */
  audio?: boolean;
}) {
  const countInRange = Math.max(1, props.range.end - props.range.start + 1);

  const safeAyat = useMemo(() => props.ayat.map(textify), [props.ayat]);
  const safeTrans = useMemo(
    () => props.translation.map(textify),
    [props.translation]
  );
  const safeTranslit = useMemo(
    () => props.transliteration.map(textify),
    [props.transliteration]
  );

  const isPractice = props.options.mode === "practice";
  const isGraded =
    props.options.mode === "drill" || props.options.mode === "recall";
  const reps = Math.max(1, props.options.reps || 1);
  const total = isPractice
    ? safeAyat.length
    : Math.max(1, safeAyat.length * reps);

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [hide, setHide] = useState<Hide>(props.options.hide);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState<boolean[]>([]);

  // show/hide translation + transliteration (shared with reader)
  const [showTrans, setShowTrans] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);

  // read saved prefs once
  useEffect(() => {
    try {
      const st = localStorage.getItem("qm:showTrans");
      const sl = localStorage.getItem("qm:showTranslit");
      if (st !== null) setShowTrans(st === "1");
      if (sl !== null) setShowTranslit(sl === "1");
    } catch {}
  }, []);

  // persist prefs on change
  useEffect(() => {
    try {
      localStorage.setItem("qm:showTrans", showTrans ? "1" : "0");
      localStorage.setItem("qm:showTranslit", showTranslit ? "1" : "0");
    } catch {}
  }, [showTrans, showTranslit]);

  const idxInRange = safeAyat.length ? idx % safeAyat.length : 0;
  const passNumber = safeAyat.length ? Math.floor(idx / safeAyat.length) + 1 : 1;

  const currentAyah = safeAyat[idxInRange] ?? "";
  const effectiveHide: Hide = isPractice ? "none" : hide; // practice uses full-hide-until-reveal semantics
  const masked = useMemo(
    () => maskAyah(currentAyah, effectiveHide),
    [currentAyah, effectiveHide]
  );
  const shownArabic = revealed ? currentAyah : masked;

  const shownTranslit = safeTranslit[idxInRange] || "";
  const shownTrans = safeTrans[idxInRange] || "";

  const atLast = idx >= total - 1;
  const progress = Math.min(idx + 1, total);
  const percent = Math.round((progress / total) * 100);

  // reset hide when options change
  useEffect(() => setHide(props.options.hide), [props.options.hide]);

  /* ---------- AUDIO DRILL STATE ---------- */

  const audioEnabled = !!props.audio;
  const [ayahAudioUrl, setAyahAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Whenever we move to a new index in range, load & auto-play that āyah
  useEffect(() => {
    if (!audioEnabled) return;
    if (!safeAyat.length) return;

    const ayahInSurah = props.range.start + idxInRange; // 1-based āyah number
    let cancelled = false;

    async function loadAudio() {
      setAudioLoading(true);
      setAudioError(null);
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/ayah/${props.number}:${ayahInSurah}/ar.alafasy`
        );
        const json = await res.json();
        const url: string | null =
          json?.data?.audioSecondary?.[0] ?? json?.data?.audio ?? null;

        if (!url) throw new Error("No audio URL for this āyah");

        if (!cancelled) {
          setAyahAudioUrl(url);
          // auto-play this āyah once URL is set
          setTimeout(() => {
            if (!cancelled && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current
                .play()
                .catch(() => {
                  // ignore autoplay errors (browser blocking etc.)
                });
            }
          }, 0);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setAyahAudioUrl(null);
          setAudioError("Audio not available for this āyah.");
        }
      } finally {
        if (!cancelled) setAudioLoading(false);
      }
    }

    loadAudio();

    return () => {
      cancelled = true;
    };
  }, [audioEnabled, props.number, props.range.start, idxInRange, safeAyat.length]);

  /* ---------- actions ---------- */

  const nextPractice = () => {
    setIdx((i) => Math.min(i + 1, total - 1));
    setRevealed(false);
  };

  const nextGraded = (correct: boolean) => {
    setAttempts((a) => [...a, correct]);
    if (correct) setScore((s) => s + 1);
    setIdx((i) => Math.min(i + 1, total - 1));
    setRevealed(false);
  };

  // ----- end screen -----
  if (idx >= total - 0 /* guard */ && atLast && revealed && !isPractice) {
    // can still mark last one below if needed
  }

  if (idx >= total) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Session Complete ✅</h2>
          {isGraded ? (
            <p className="text-gray-700">
              You completed {total} recalls with a score of{" "}
              <span className="font-semibold text-emerald-600">
                {score}/{total}
              </span>{" "}
              ({Math.round((score / Math.max(1, total)) * 100)}%)
            </p>
          ) : (
            <p className="text-gray-700">
              You viewed {total} āyāt in Practice mode.
            </p>
          )}

          {isGraded && (
            <div className="mt-4 flex justify-center flex-wrap gap-2">
              {attempts.map((ok, i) => (
                <span
                  key={i}
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    ok
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <Link
              className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
              href={`/surah/${props.slug}`}
            >
              Back to {props.name}
            </Link>
            <button
              onClick={() => {
                setIdx(0);
                setScore(0);
                setAttempts([]);
                setRevealed(false);
              }}
              className="rounded-xl border px-4 py-2"
            >
              Repeat session
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- main UI ---------- */

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {props.name} ({props.arabic}) · {props.range.start + idxInRange} of{" "}
            {countInRange}
            {!isPractice && reps > 1 ? ` · rep ${passNumber}/${reps}` : ""}
          </div>
          <Link className="text-sm underline" href={`/surah/${props.slug}`}>
            change range
          </Link>
        </div>

        {/* translation / transliteration toggles */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-700">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTrans}
              onChange={(e) => setShowTrans(e.target.checked)}
            />
            <span>Show translation</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTranslit}
              onChange={(e) => setShowTranslit(e.target.checked)}
            />
            <span>Show transliteration</span>
          </label>
        </div>

        {/* AUDIO DRILL CONTROLS */}
        {audioEnabled && (
          <>
            <audio
              ref={audioRef}
              src={ayahAudioUrl ?? undefined}
              onPlay={() => setIsAudioPlaying(true)}
              onPause={() => setIsAudioPlaying(false)}
              onEnded={() => setIsAudioPlaying(false)}
              className="hidden"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-700">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                Audio memorisation · āyah {props.range.start + idxInRange}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!audioRef.current) return;
                  if (isAudioPlaying) {
                    audioRef.current.pause();
                  } else {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => {});
                  }
                }}
                disabled={audioLoading || !ayahAudioUrl}
                className="rounded-full border px-3 py-1 text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {audioLoading
                  ? "Loading audio…"
                  : isAudioPlaying
                  ? "Pause audio"
                  : "Replay audio"}
              </button>
              {audioError && (
                <span className="text-[11px] text-red-500">{audioError}</span>
              )}
            </div>
          </>
        )}

        {/* ARABIC + TEXT */}
        <div className="mt-4">
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-2xl leading-relaxed text-right"
          >
            {textify(shownArabic)}
          </p>

          {shownTranslit && showTranslit && (
            <p className="mt-3 text-sm italic text-gray-700">
              {shownTranslit}
            </p>
          )}

          {revealed && showTrans && shownTrans && (
            <p className="mt-1 text-sm text-gray-600">{shownTrans}</p>
          )}
        </div>

        {/* CONTROLS */}
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
            >
              Reveal
            </button>
          ) : isPractice ? (
            <>
              <button
                onClick={nextPractice}
                disabled={atLast}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => setRevealed(false)}
                className="rounded-xl border px-4 py-2"
              >
                Hide
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => nextGraded(true)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
              >
                I remembered
              </button>
              <button
                onClick={() => nextGraded(false)}
                className="rounded-xl border px-4 py-2"
              >
                I forgot
              </button>
            </>
          )}

          {isGraded && (
            <label className="ml-auto text-sm">
              Hide mode:&nbsp;
              <select
                value={hide}
                onChange={(e) => setHide(e.target.value as Hide)}
                className="rounded-lg border px-2 py-1"
              >
                <option value="first-word">first-word</option>
                <option value="word">word</option>
                <option value="full">full</option>
                <option value="none">none</option>
              </select>
            </label>
          )}
        </div>
      </div>

      {/* progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

const RLM = "\u061C";

function textify(v: unknown): string {
  return typeof v === "string"
    ? v
    : v == null
    ? ""
    : Array.isArray(v)
    ? v.map(textify).join(" ")
    : typeof v === "object"
    ? ""
    : String(v);
}

// Session semantics: "none" means fully hidden until reveal
function maskAyah(ayah: string, hide: Hide): string {
  if (hide === "none") return "••••••••••••";
  const words = ayah.trim().split(/\s+/);
  if (hide === "full") return "••••••••••••";
  if (hide === "word") return words.map(() => RLM + "…").join(" ");
  if (hide === "first-word") {
    if (words.length === 0) return "••••••••••••";
    const [first, ...rest] = words;
    const masked = rest.map(() => RLM + "…").join(" ");
    return masked ? `${first} ${masked}` : first;
  }
  return ayah;
}
