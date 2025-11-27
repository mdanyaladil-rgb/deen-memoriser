// components/ListeningDrill.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type ListeningMode = "shadow" | "delay" | "word";

type ListeningDrillProps = {
  slug: string;
  number: number; // surah number (1–114)
  ayat: string[];
  transliteration?: string[];
  range?: { start: number; end: number }; // 1-based, optional
};

export default function ListeningDrill({
  slug,
  number,
  ayat,
  transliteration,
  range,
}: ListeningDrillProps) {
  const from = (range?.start ?? 1) - 1;
  const to = (range?.end ?? ayat.length) - 1;

  const slicedAyat = ayat.slice(from, to + 1);
  const slicedTranslit = transliteration
    ? transliteration.slice(from, to + 1)
    : undefined;

  const [current, setCurrent] = useState(0); // index in sliced arrays
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<ListeningMode>("shadow");
  const [delaySeconds, setDelaySeconds] = useState(5);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = slicedAyat.length;
  const ayahNumber = from + current + 1; // real ayah number in surah

  // 👉 full-surah audio straight from CDN (Mishary Alafasy)
  // pattern: https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/{surahNumber}.mp3
  const audioSrc = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${number}.mp3`;

  // Clean up timers when unmounting
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const goNext = () => {
    setCurrent((prev) => (prev + 1 < total ? prev + 1 : prev));
  };

  const goPrev = () => {
    setCurrent((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
  };

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Different behaviour depending on mode
    if (mode === "shadow") {
      // Play full surah once, then give silent time for user to repeat parts
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          // after gap, auto-advance ayah focus
          goNext();
        }, delaySeconds * 1000);
      };
    } else if (mode === "delay") {
      // Wait for X seconds before playing audio (user tries from memory first)
      setIsPlaying(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        audio.currentTime = 0;
        audio.play();
        audio.onended = () => {
          setIsPlaying(false);
        };
      }, delaySeconds * 1000);
    } else {
      // "word" mode – normal audio play, tap words to visually focus
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handleWordClick = (index: number) => {
    const el = document.querySelector(
      `[data-word="${slug}-${ayahNumber}-${index}"]`
    ) as HTMLElement | null;
    if (!el) return;
    el.classList.add("bg-emerald-100");
    setTimeout(() => el.classList.remove("bg-emerald-100"), 300);
  };

  const currentAyah = slicedAyat[current] ?? "";
  const currentTranslit = slicedTranslit?.[current];

  const words = currentAyah.split(" ");

  return (
    <section className="mt-6 space-y-4">
      {/* Mode selector */}
      <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs sm:text-sm">
        {([
          ["shadow", "Shadow Recite"],
          ["delay", "Delayed Audio"],
          ["word", "Word-by-word"],
        ] as [ListeningMode, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => {
              setMode(val);
              setIsPlaying(false);
              const audio = audioRef.current;
              if (audio) audio.pause();
              if (timerRef.current) clearTimeout(timerRef.current);
            }}
            className={`px-3 py-1 rounded-full transition ${
              mode === val
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
        <span>
          Ayah {ayahNumber} of {ayat.length}
        </span>
        <div className="flex items-center gap-2">
          {(mode === "shadow" || mode === "delay") && (
            <>
              <span className="hidden sm:inline">Gap / Delay:</span>
              <input
                type="range"
                min={2}
                max={15}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="w-28"
              />
              <span>{delaySeconds}s</span>
            </>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-3xl border border-emerald-100 bg-white/80 shadow-sm backdrop-blur p-4 sm:p-6 space-y-4">
        {/* Arabic */}
        <p className="text-2xl sm:text-3xl leading-relaxed text-right font-semibold tracking-wide">
          {mode === "word"
            ? words.map((w, i) => (
                <button
                  key={i}
                  type="button"
                  data-word={`${slug}-${ayahNumber}-${i}`}
                  onClick={() => handleWordClick(i)}
                  className="mx-1 inline-block rounded-md px-1 hover:bg-emerald-50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  {w}
                </button>
              ))
            : currentAyah}
        </p>

        {/* Transliteration (optional) */}
        {currentTranslit && (
          <p className="text-sm sm:text-base text-slate-700 italic text-right">
            {currentTranslit}
          </p>
        )}

        {/* Helper text */}
        <p className="text-xs sm:text-sm text-slate-500">
          {mode === "shadow" &&
            "Listen to the surah, then use the silent gap to repeat from memory while focusing on this āyah."}
          {mode === "delay" &&
            "Try to recite the āyah before the audio starts. The recitation will play after the delay as a check."}
          {mode === "word" &&
            "Tap individual words to focus on them while you listen to the recitation."}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="rounded-full border px-3 py-1 text-xs sm:text-sm hover:bg-slate-50"
            >
              ◀ Prev
            </button>
            <button
              onClick={goNext}
              className="rounded-full border px-3 py-1 text-xs sm:text-sm hover:bg-slate-50"
            >
              Next ▶
            </button>
          </div>

          <button
            onClick={handlePlay}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow hover:bg-emerald-700"
          >
            {isPlaying ? "Stop audio" : "Play surah audio"}
          </button>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioSrc} preload="auto" />
      </div>
    </section>
  );
}
