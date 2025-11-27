// app/session/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SURAH_MAP } from "@/data/surahs";
import { saveSession, uid, type SessionResult } from "@/lib/progress";

type Mode = "practice" | "drill" | "recall";
type Hide = "none" | "first-word" | "word" | "full" | "half";
type Focus = "arabic" | "translit";

/* ----------------------------- Helpers ----------------------------- */

// Arabic Letter Mark was used before; keeping in case needed later
const RLM = "\u061C"; // Arabic Letter Mark to force RTL for neutral chars

const textify = (v: unknown): string =>
  typeof v === "string"
    ? v
    : Array.isArray(v)
    ? v.map(textify).join(" ")
    : v == null || typeof v === "object"
    ? ""
    : String(v);

// handles arrays, { ayahs: {...} }, or {"1": "...", ...}
function normalizeVerses(x: unknown): string[] {
  if (!x) return [];

  if (Array.isArray(x)) {
    if (
      x.length === 1 &&
      x[0] &&
      typeof x[0] === "object" &&
      "ayahs" in (x[0] as any)
    ) {
      return normalizeVerses((x[0] as any).ayahs);
    }
    return x.map((v) => (typeof v === "string" ? v : ""));
  }

  if (x && typeof x === "object" && "ayahs" in (x as any)) {
    const ayahsObj = (x as any).ayahs as Record<string, unknown>;
    return Object.keys(ayahsObj)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) =>
        typeof ayahsObj[k] === "string" ? (ayahsObj[k] as string) : ""
      );
  }

  if (x && typeof x === "object") {
    const obj = x as Record<string, unknown>;
    return Object.keys(obj)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => (typeof obj[k] === "string" ? (obj[k] as string) : ""));
  }

  return [];
}

/**
 * MaskedAyah
 * - Shows the same words but blurred when hidden
 * - Preserves exact word length + spacing for better recall
 *
 * Semantics:
 * - "none"       → show everything clearly
 * - "full"       → blur every word
 * - "word"       → blur every word (same as full for now)
 * - "first-word" → show first word, blur the rest
 * - "half"       → show every other word (approx. 50% hidden)
 */
function MaskedAyah({ text, hide }: { text: string; hide: Hide }) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return null;

  return (
    <>
      {words.map((word, i) => {
        let shouldHide = false;

        if (hide === "full" || hide === "word") {
          // hide all words
          shouldHide = true;
        } else if (hide === "first-word") {
          // show first word, hide the rest
          shouldHide = i > 0;
        } else if (hide === "half") {
          // hide every second word → indices 1,3,5,...
          shouldHide = i % 2 === 1;
        } else if (hide === "none") {
          shouldHide = false;
        }

        if (!shouldHide) {
          return (
            <span key={i} className="mx-1">
              {word}
            </span>
          );
        }

        // blurred proportional placeholder: same word, but unreadable
        return (
          <span
            key={i}
            className="mx-1 inline-block blur-sm opacity-60 select-none"
          >
            {word}
          </span>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */

export default function SessionPage() {
  const searchParams = useSearchParams();

  const slug =
    searchParams.get("slug") ??
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("slug")
      : null) ??
    "";

  const modeFromQuery = (searchParams.get("mode") as Mode) || "practice"; // kept for future if needed
  const hide = (searchParams.get("hide") as Hide) || "none";
  const repsParam = Number(searchParams.get("reps") || 1);
  const startParam = Number(searchParams.get("start") || 1);
  const endParam = Number(searchParams.get("end") || 1);

  const reps = Number.isFinite(repsParam) && repsParam > 0 ? repsParam : 1;
  const start = Number.isFinite(startParam) && startParam > 0 ? startParam : 1;
  const end = Number.isFinite(endParam) && endParam > 0 ? endParam : 1;

  const surah = slug ? SURAH_MAP[slug] : undefined;

  /* --------------------------- Guard --------------------------- */

  if (!surah) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Surah not found</h1>
        <p className="text-gray-600 mt-2">
          Please return to the practice page.
        </p>
        <Link
          href="/practice"
          className="mt-4 inline-block rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Back to Practice
        </Link>
      </main>
    );
  }

  /* --------------------------- Session State --------------------------- */

  const ayat = surah.ayat.slice(start - 1, end);
  const total = Math.max(1, ayat.length * Math.max(1, reps));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState<boolean[]>([]);

  const [translation, setTranslation] = useState<string[]>([]);
  const [transliteration, setTransliteration] = useState<string[]>([]);

  const [focus, setFocus] = useState<Focus>("arabic");

  // have we already saved this finished session to progress?
  const hasSavedRef = useRef(false);

  // load extras from /public
  useEffect(() => {
    let mounted = true;

    async function loadExtras() {
      try {
        const [tRes, tlRes] = await Promise.all([
          fetch(`/translations/en-pickthall/${slug}.json`).catch(() => null),
          fetch(`/transliterations/${slug}.json`).catch(() => null),
        ]);

        const tJson = tRes && tRes.ok ? await tRes.json() : [];
        const tlJson = tlRes && tlRes.ok ? await tlRes.json() : [];

        const tArr = normalizeVerses(tJson).slice(start - 1, end);
        const tlArr = normalizeVerses(tlJson).slice(start - 1, end);

        if (mounted) {
          setTranslation(tArr);
          setTransliteration(tlArr);
        }
      } catch {
        if (mounted) {
          setTranslation([]);
          setTransliteration([]);
        }
      }
    }

    loadExtras();
    return () => {
      mounted = false;
    };
  }, [slug, start, end]);

  /* --------------------------- Derived --------------------------- */

  const idxInRange = ayat.length ? currentIndex % ayat.length : 0;
  const currentArabic = ayat[idxInRange] ?? "";
  const currentTranslit = transliteration[idxInRange] ?? "";

  // What we’re memorising in the big line
  const focusText =
    focus === "translit" && currentTranslit ? currentTranslit : currentArabic;

  const progress = Math.min(currentIndex + 1, total);
  const percent = Math.round((progress / total) * 100);

  /* --------------------------- Handlers --------------------------- */

  const handleNext = (correct: boolean) => {
    setAttempts((a) => [...a, correct]);
    if (correct) setScore((s) => s + 1);
    setRevealed(false);
    setCurrentIndex((i) => i + 1);
  };

  const restartSession = () => {
    setScore(0);
    setCurrentIndex(0);
    setAttempts([]);
    setRevealed(false);
    hasSavedRef.current = false;
  };

  /* --------------------------- Keyboard Shortcuts --------------------------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key ?? "";
      if (key === " " || key === "Enter") {
        e.preventDefault();
        if (!revealed) setRevealed(true);
        else handleNext(true);
      } else if (key === "ArrowRight") {
        if (revealed) handleNext(true);
      } else if (key === "ArrowLeft") {
        if (revealed) handleNext(false);
      } else if (key.toLowerCase?.() === "r") {
        restartSession();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [revealed]);

  /* --------------------------- Save to progress when finished --------------------------- */
  useEffect(() => {
    if (currentIndex < total) return;
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    const run = async () => {
      try {
        const percentScore =
          total > 0 ? Math.round((score / total) * 100) : 0;

        const session: SessionResult = {
          id: uid(),
          at: Date.now(),
          slug,
          name: surah.name,
          number: surah.number,
          range: { start, end },
          reps,
          mode: "recall",
          correct: score,
          total,
          percent: percentScore,
          attempts,
          focus, // NEW
          hide, // NEW
        };

        await saveSession(session);
      } catch (e) {
        console.error("Failed to save session result:", e);
      }
    };

    run();
  }, [
    currentIndex,
    total,
    slug,
    surah.name,
    surah.number,
    start,
    end,
    reps,
    score,
    attempts,
    focus,
    hide,
  ]);

  /* --------------------------- End of Session UI --------------------------- */

  if (currentIndex >= total) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Session Complete ✅</h1>
        <p className="text-lg text-gray-700 mb-6">
          You completed {total} recalls with a score of{" "}
          <span className="font-semibold text-emerald-600">
            {score}/{total}
          </span>{" "}
          ({Math.round((score / total) * 100)}%)
        </p>

        <div className="flex justify-center flex-wrap gap-2 mb-6">
          {attempts.map((correct, i) => (
            <span
              key={i}
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                correct
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <Link
            href={`/surah/${slug}`}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-white font-semibold hover:bg-emerald-700"
          >
            Back to {surah.name}
          </Link>
          <button
            onClick={restartSession}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold hover:bg-gray-50"
          >
            Repeat Session (R)
          </button>
        </div>
      </main>
    );
  }

  /* --------------------------- Main View --------------------------- */

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-center space-y-6 select-none">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          {surah.name} ({surah.arabic}) — āyah {start + idxInRange}
        </span>
        <span>
          Progress: {progress}/{total} ({percent}%)
        </span>
      </div>

      {/* Focus toggle – Arabic vs Transliteration */}
      <div className="flex justify-center gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => setFocus("arabic")}
          className={`rounded-full px-3 py-1 border ${
            focus === "arabic"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          Memorise Arabic
        </button>
        <button
          type="button"
          onClick={() => setFocus("translit")}
          className={`rounded-full px-3 py-1 border ${
            focus === "translit"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          Memorise Transliteration
        </button>
      </div>

      {/* ONE unified mushaf-style card */}
      <div className="border rounded-2xl p-6 bg-white shadow-sm space-y-4 text-left">
        {/* Top: page-like context – ONLY previous lines */}
        <div className="border-b border-gray-200 pb-3 space-y-2">
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Āyāt {start}–{start + ayat.length - 1}
          </div>

          <div className="space-y-2">
            {(focus === "arabic"
              ? ayat.slice(0, idxInRange)
              : transliteration.slice(0, idxInRange)
            ).map((line, i) => {
              if (!line) return null;
              const verseNumber = start + i;

              return (
                <div
                  key={i}
                  className="flex items-baseline gap-2 justify-between"
                >
                  <p
                    dir={focus === "arabic" ? "rtl" : "ltr"}
                    lang={focus === "arabic" ? "ar" : undefined}
                    className={
                      focus === "arabic"
                        ? "font-arabic leading-relaxed text-right text-xl text-gray-800 flex-1"
                        : "leading-relaxed text-sm text-gray-800 italic flex-1"
                    }
                  >
                    {line}
                  </p>

                  <span className="ml-2 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-semibold bg-gray-200 text-gray-700">
                    {verseNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: memorisation focus + help text */}
        <div className="text-center space-y-3">
          {/* Big memorisation line (Arabic or transliteration based on focus) */}
          <p
            dir={focus === "arabic" ? "rtl" : "ltr"}
            lang={focus === "arabic" ? "ar" : undefined}
            className={`leading-relaxed ${
              focus === "arabic"
                ? "font-arabic text-3xl text-right"
                : "text-2xl"
            }`}
          >
            {revealed ? (
              textify(focusText)
            ) : (
              <MaskedAyah text={focusText} hide={hide} />
            )}
          </p>

          {/* After reveal, show helper lines */}
          {revealed && (
            <>
              {/* In Arabic mode: show transliteration under the Arabic */}
              {focus === "arabic" && textify(currentTranslit) && (
                <p className="text-sm text-gray-700 italic">
                  {textify(currentTranslit)}
                </p>
              )}

              {/* In transliteration mode: show Arabic under the transliteration */}
              {focus === "translit" && textify(currentArabic) && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-xl leading-relaxed text-right"
                >
                  {textify(currentArabic)}
                </p>
              )}

              {/* Translation for the current āyah */}
              {textify(translation[idxInRange]) && (
                <p className="text-sm text-gray-600">
                  {textify(translation[idxInRange])}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls + progress bar */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="rounded-xl bg-emerald-600 px-6 py-2.5 text-white font-semibold hover:bg-emerald-700"
        >
          Reveal (Space / Enter)
        </button>
      ) : (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleNext(true)}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-white font-semibold hover:bg-emerald-700"
          >
            I remembered (→)
          </button>
          <button
            onClick={() => handleNext(false)}
            className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-semibold hover:bg-gray-50"
          >
            I forgot (←)
          </button>
        </div>
      )}

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </main>
  );
}
