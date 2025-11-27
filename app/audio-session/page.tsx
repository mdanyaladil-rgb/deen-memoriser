// app/audio-session/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { SURAH_MAP } from "@/data/surahs";

type Hide = "none" | "first-word" | "word" | "full" | "half";
type Focus = "arabic" | "translit";

/* ----------------------------- Helpers ----------------------------- */

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
 */
function MaskedAyah({ text, hide }: { text: string; hide: Hide }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;

  return (
    <>
      {words.map((word, i) => {
        let shouldHide = false;

        if (hide === "full" || hide === "word") {
          shouldHide = true;
        } else if (hide === "first-word") {
          shouldHide = i > 0;
        } else if (hide === "half") {
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

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const total = Math.floor(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */

export default function AudioSessionPage() {
  const searchParams = useSearchParams();

  const slug =
    searchParams.get("slug") ??
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("slug")
      : null) ??
    "";

  const hide = (searchParams.get("hide") as Hide) || "none";
  const repsParam = Number(searchParams.get("reps") || 1);
  const startParam = Number(searchParams.get("start") || 1);
  const endParam = Number(searchParams.get("end") || 1);

  const reps = Number.isFinite(repsParam) && repsParam > 0 ? repsParam : 1;
  const start = Number.isFinite(startParam) && startParam > 0 ? startParam : 1;
  const end = Number.isFinite(endParam) && endParam > 0 ? endParam : 1;

  const surah = slug ? SURAH_MAP[slug] : undefined;

  /* --------------------------- Guards --------------------------- */

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

  const ayat = surah.ayat.slice(start - 1, end);
  if (!ayat.length) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">No āyāt selected</h1>
        <p className="text-gray-600 mt-2">
          The range you picked doesn&apos;t include any verses.
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

  /* --------------------------- State --------------------------- */

  const total = Math.max(1, ayat.length * Math.max(1, reps));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState<boolean[]>([]);
  const [focus, setFocus] = useState<Focus>("arabic");

  const [translation, setTranslation] = useState<string[]>([]);
  const [transliteration, setTransliteration] = useState<string[]>([]);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // custom player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /* --------------------------- Load extras --------------------------- */

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
  const focusText =
    focus === "translit" && currentTranslit ? currentTranslit : currentArabic;

  const progress = Math.min(currentIndex + 1, total);
  const percent = Math.round((progress / total) * 100);

  const ayahNumberInSurah = start + idxInRange;

  /* --------------------------- Load audio per āyah --------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadAudio() {
      setAudioLoading(true);
      setAudioError(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      try {
        // Using AlQuran Cloud – Mishary Alafasy
        const res = await fetch(
          `https://api.alquran.cloud/v1/ayah/${surah.number}:${ayahNumberInSurah}/ar.alafasy`
        );
        const json = await res.json();

        const url: string | null =
          json?.data?.audioSecondary?.[0] ?? json?.data?.audio ?? null;

        if (!url) throw new Error("No audio URL for this āyah.");

        if (!cancelled) {
          setAudioUrl(url);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setAudioUrl(null);
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
  }, [surah.number, ayahNumberInSurah]);

  /* --------------------------- Hook audio events --------------------------- */

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(el.currentTime || 0);
    const onLoaded = () => setDuration(el.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(el.duration || 0);
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const progressPercent =
    duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) * 100 : 0;

  const handlePlayPause = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      el
        .play()
        .then(() => {
          // ok
        })
        .catch(() => {
          // autoplay blocked etc.
        });
    }
  };

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
  };

  /* --------------------------- Keyboard shortcuts --------------------------- */

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

  /* --------------------------- End of session UI --------------------------- */

  if (currentIndex >= total) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Audio Session Complete ✅</h1>
        <p className="text-lg text-gray-700 mb-6">
          You completed {total} listens with a score of{" "}
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
            Repeat Audio Session (R)
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
          {surah.name} ({surah.arabic}) — āyah {ayahNumberInSurah}
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
          Memorise Arabic (with audio)
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
          Memorise Transliteration (with audio)
        </button>
      </div>

      {/* Card */}
      <div className="border rounded-2xl p-6 bg-white shadow-sm space-y-4 text-left">
        {/* Audio controls */}
        <div className="mb-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 text-center">
            Audio for āyah {ayahNumberInSurah}
          </p>

          {audioLoading && (
            <p className="text-sm text-gray-500 text-center">
              Loading audio…
            </p>
          )}
          {audioError && (
            <p className="text-sm text-red-500 text-center">{audioError}</p>
          )}

          {audioUrl && (
            <>
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow ${
                      isPlaying ? "bg-emerald-600" : "bg-emerald-500"
                    }`}
                  >
                    {isPlaying ? (
                      <span className="text-lg leading-none">⏸</span>
                    ) : (
                      <span className="ml-0.5 text-lg leading-none">▶</span>
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-900/80">
                      <span>{isPlaying ? "Playing…" : "Tap to play"}</span>
                      <span>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* hidden native audio element */}
              <audio ref={audioRef} src={audioUrl} className="hidden" />
            </>
          )}
        </div>

        {/* Text memorisation area */}
        <div className="border-t border-gray-200 pt-4 text-center space-y-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Listen, recite from memory, then reveal to check.
          </p>

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

          {revealed && (
            <>
              {/* In Arabic mode: show transliteration */}
              {focus === "arabic" && textify(currentTranslit) && (
                <p className="text-sm text-gray-700 italic">
                  {textify(currentTranslit)}
                </p>
              )}

              {/* In transliteration mode: show Arabic */}
              {focus === "translit" && textify(currentArabic) && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-xl leading-relaxed text-right"
                >
                  {textify(currentArabic)}
                </p>
              )}

              {/* Translation */}
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
