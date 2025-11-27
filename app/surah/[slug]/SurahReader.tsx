"use client";

import { useEffect, useRef, useState } from "react";

/** Convert any verse value into a displayable string.
 *  Handles strings, objects (picks common fields or first string), arrays.
 */
function toPlain(v: unknown): string {
  if (typeof v === "string") return v;

  if (Array.isArray(v)) {
    const s = v.map(toPlain).filter(Boolean).join(" ");
    return s;
  }

  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    // common fields we might encounter
    for (const k of [
      "text",
      "content",
      "value",
      "en",
      "translation",
      "transliteration",
      "line",
      "t",
      "v",
    ]) {
      if (typeof o[k] === "string") return o[k] as string;
      const s = toPlain(o[k]);
      if (s) return s;
    }
    // otherwise, first stringy thing anywhere
    for (const val of Object.values(o)) {
      const s = toPlain(val);
      if (s) return s;
    }
  }

  return "";
}

type FontSize = "sm" | "md" | "lg";

export default function SurahReader(props: {
  start: number;
  ayat: string[];
  translation: unknown[];
  transliteration: unknown[];
  /** Surah number 1–114 (for ayah audio lookups) */
  surahNumber: number;
  /** Optional full-surah audio URL */
  audioSrc?: string;
}) {
  const [showTrans, setShowTrans] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("md");

  const showBismillahHeader = props.start === 1;

  // For sticky header / progress
  const [currentAyah, setCurrentAyah] = useState(props.start);
  const verseRefs = useRef<(HTMLLIElement | null)[]>([]);

  const totalAyat = props.ayat.length;
  const maxAyah = props.start + totalAyat - 1;

  const rawProgress =
    totalAyat > 0 ? (currentAyah - props.start + 1) / totalAyat : 0;

  const progress = Math.max(0, Math.min(1, rawProgress));

  // 🔊 per-ayah audio state
  const [activeAyahIdx, setActiveAyahIdx] = useState<number | null>(null);
  const [loadingAyahIdx, setLoadingAyahIdx] = useState<number | null>(null);
  const [ayahAudioSrc, setAyahAudioSrc] = useState<string | null>(null);
  const ayahAudioRef = useRef<HTMLAudioElement | null>(null);
  const ayahAudioCache = useRef<Record<number, string>>({}); // key: global "surah:ayah in surah"

  // read saved prefs once
  useEffect(() => {
    try {
      const st = localStorage.getItem("qm:showTrans");
      const sl = localStorage.getItem("qm:showTranslit");
      const rm = localStorage.getItem("qm:readingMode");
      const nm = localStorage.getItem("qm:nightMode");
      const fs = localStorage.getItem("qm:fontSize");

      if (st !== null) setShowTrans(st === "1");
      if (sl !== null) setShowTranslit(sl === "1");
      if (rm !== null) setReadingMode(rm === "1");
      if (nm !== null) setNightMode(nm === "1");
      if (fs === "sm" || fs === "md" || fs === "lg") setFontSize(fs);
    } catch {}
  }, []);

  // persist translation / transliteration prefs
  useEffect(() => {
    try {
      localStorage.setItem("qm:showTrans", showTrans ? "1" : "0");
      localStorage.setItem("qm:showTranslit", showTranslit ? "1" : "0");
    } catch {}
  }, [showTrans, showTranslit]);

  // persist reading / night / font
  useEffect(() => {
    try {
      localStorage.setItem("qm:readingMode", readingMode ? "1" : "0");
      localStorage.setItem("qm:nightMode", nightMode ? "1" : "0");
      localStorage.setItem("qm:fontSize", fontSize);
    } catch {}
  }, [readingMode, nightMode, fontSize]);

  // lock body scroll when in reading mode
  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (readingMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [readingMode]);

  // keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setReadingMode((prev) => !prev);
      }
      if (e.key === "Escape") {
        setReadingMode(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Track which ayah is in view (for header + progress)
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxAttr = entry.target.getAttribute("data-idx");
            if (!idxAttr) return;
            const idx = Number(idxAttr);
            if (!Number.isNaN(idx)) {
              setCurrentAyah(props.start + idx);
            }
          }
        });
      },
      {
        root: null,
        threshold: 0.5,
      }
    );

    verseRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [props.start, totalAyat, readingMode]);

  // ---- per-ayah audio handler ----
  async function playAyah(idx: number) {
    const ayahInSurah = props.start + idx;

    // toggle pause if same ayah is already playing
    if (activeAyahIdx === idx && ayahAudioRef.current && !ayahAudioRef.current.paused) {
      ayahAudioRef.current.pause();
      setActiveAyahIdx(null);
      return;
    }

    setActiveAyahIdx(idx);
    setLoadingAyahIdx(idx);

    try {
      let url = ayahAudioCache.current[ayahInSurah];

      if (!url) {
        // Use AlQuran Cloud API to get ayah audio URL
        const res = await fetch(
          `https://api.alquran.cloud/v1/ayah/${props.surahNumber}:${ayahInSurah}/ar.alafasy`
        );
        const json = await res.json();
        url =
          json?.data?.audioSecondary?.[0] ??
          json?.data?.audio ??
          null;

        if (!url) {
          throw new Error("No audio URL returned for this āyah");
        }

        ayahAudioCache.current[ayahInSurah] = url;
      }

      setAyahAudioSrc(url);

      // wait for React to update src, then play
      setTimeout(() => {
        if (ayahAudioRef.current) {
          ayahAudioRef.current.currentTime = 0;
          ayahAudioRef.current
            .play()
            .catch(() => {
              // ignore play errors (e.g. autoplay blocked)
            });
        }
      }, 0);
    } catch (e) {
      console.error(e);
      setActiveAyahIdx(null);
    } finally {
      setLoadingAyahIdx(null);
    }
  }

  // ---- Styling helpers ----

  const pageClass = [
    "mushaf-page",
    "relative overflow-hidden rounded-[32px] border transition-all duration-500",
    "p-4 sm:p-6",
    readingMode
      ? "md:max-w-5xl md:px-10 md:py-9 md:scale-[1.01]"
      : "mx-auto md:max-w-4xl",
    nightMode
      ? "bg-[radial-gradient(circle_at_top,_#020617,_#0f172a)] border-teal-700/60 text-emerald-50 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
      : "bg-[radial-gradient(circle_at_top,_#ddf7ef,_#f9fafb)] border-teal-100/80 text-slate-900 shadow-sm",
  ]
    .filter(Boolean)
    .join(" ");

  const bismillahClass = nightMode
    ? "font-arabic text-2xl leading-relaxed text-emerald-100 sm:text-3xl md:text-[2.1rem]"
    : "font-arabic text-2xl leading-relaxed text-teal-800 sm:text-3xl md:text-[2.1rem]";

  const arabicSizeClass: Record<FontSize, string> = {
    sm: "text-lg sm:text-xl md:text-2xl",
    md: "text-xl sm:text-2xl md:text-[1.7rem]",
    lg: "text-2xl sm:text-[1.9rem] md:text-[2.1rem]",
  };

  const verseHoverClass = nightMode
    ? "hover:bg-teal-900/40"
    : "hover:bg-emerald-50/70";

  const translationTextClass = nightMode
    ? "mt-1 text-center text-[13px] text-emerald-100/80 sm:text-sm"
    : "mt-1 text-center text-[13px] text-gray-600 sm:text-sm";

  const translitTextClass = nightMode
    ? "mt-1 text-center text-[13px] italic text-emerald-100/90 sm:text-sm"
    : "mt-1 text-center text-[13px] italic text-gray-700 sm:text-sm";

  const bubbleBase =
    "ayah-bubble mt-1 inline-flex flex-none items-center justify-center rounded-full text-[11px] font-bold text-white shadow";

  const bubbleClass = nightMode
    ? `${bubbleBase} h-8 w-8 bg-emerald-500`
    : `${bubbleBase} h-7 w-7 bg-teal-600`;

  const subtleTopStripClass = nightMode
    ? "pointer-events-none absolute inset-x-6 top-4 h-[3px] rounded-full bg-gradient-to-r from-emerald-500/40 via-teal-400/50 to-emerald-500/40"
    : "pointer-events-none absolute inset-x-6 top-4 h-[3px] rounded-full bg-gradient-to-r from-teal-500/30 via-emerald-300/40 to-teal-500/30";

  const glowOneClass = nightMode
    ? "pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl"
    : "pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl";

  const glowTwoClass = nightMode
    ? "pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-teal-900/60 blur-3xl"
    : "pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-emerald-50 blur-3xl";

  // ---- Reusable page (used both inline & overlay) ----
  const page = (
    <div className={pageClass} data-reading={readingMode ? "on" : "off"}>
      {/* background glows */}
      <div aria-hidden="true" className={glowOneClass} />
      <div aria-hidden="true" className={glowTwoClass} />

      {/* inner frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 rounded-[28px] border border-teal-100/60 dark:border-teal-700/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-10 left-6 hidden w-px bg-gradient-to-b from-teal-100 via-teal-300/60 to-teal-100 md:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-10 right-6 hidden w-px bg-gradient-to-b from-teal-100 via-teal-300/60 to-teal-100 md:block"
      />

      <div className={subtleTopStripClass} />

      {/* Bismillah */}
      {showBismillahHeader && (
        <div className="relative mb-6 mt-4 space-y-1 text-center">
          <p dir="rtl" lang="ar" className={bismillahClass}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p
            className={
              "text-[11px] uppercase tracking-[0.25em] " +
              (nightMode ? "text-emerald-200/80" : "text-gray-500")
            }
          >
            Bismillāh ar-Raḥmān ar-Raḥīm
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-emerald-500">
            <span className="h-px w-10 bg-emerald-200/70" />
            <span className="text-xs">◆</span>
            <span className="h-px w-10 bg-emerald-200/70" />
          </div>
        </div>
      )}

      {/* Verses */}
      <ol
        start={props.start}
        className={
          "relative z-[1] py-3 sm:py-4 " +
          (readingMode ? "space-y-4 sm:space-y-5" : "space-y-3 sm:space-y-4")
        }
      >
        {props.ayat.map((arabic, i) => {
          const t = toPlain(props.translation[i]);
          const tl = toPlain(props.transliteration[i]);
          const ayahNumber = props.start + i;

          const arabicTextClass =
            "font-arabic leading-relaxed text-right " +
            arabicSizeClass[fontSize];

          const isActive = activeAyahIdx === i;

          const activeClasses = isActive
            ? nightMode
              ? "border border-emerald-400/80 bg-teal-900/60 shadow-sm"
              : "border border-emerald-400/80 bg-emerald-50 shadow-sm"
            : "border border-transparent";

          return (
            <li
              key={i}
              data-idx={i}
              ref={(el) => {
                verseRefs.current[i] = el;
              }}
              className={`ayah-animate mx-auto max-w-3xl rounded-2xl px-2 py-3 transition ${verseHoverClass} sm:px-3 md:px-4 ${activeClasses}`}
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex flex-row-reverse items-baseline justify-center gap-3">
                  <p dir="rtl" lang="ar" className={arabicTextClass}>
                    {arabic}
                  </p>
                  <span className={bubbleClass}>{ayahNumber}</span>
                </div>

                {/* per-ayah audio button */}
                <button
                  type="button"
                  onClick={() => playAyah(i)}
                  className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-500/60 px-3 py-1 text-[11px] text-emerald-700 hover:bg-emerald-50 sm:text-xs"
                >
                  {loadingAyahIdx === i ? "Loading…" : isActive ? "Pause āyah" : "Play āyah"}
                </button>

                {showTranslit && tl && (
                  <p className={translitTextClass}>{tl}</p>
                )}

                {showTrans && t && <p className={translationTextClass}>{t}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {/* bottom strip */}
      <div className="relative mt-3 flex itemscenter justify-center gap-2 text-emerald-400 sm:mt-4">
        <span className="h-px w-8 bg-emerald-100/70" />
        <span className="text-[11px] tracking-[0.3em]">● ● ●</span>
        <span className="h-px w-8 bg-emerald-100/70" />
      </div>
    </div>
  );

  // Sticky header
  const stickyHeaderBg = nightMode
    ? "bg-slate-900/80 text-emerald-50"
    : "bg-white/80 text-emerald-900";

  const progressBg = nightMode ? "bg-teal-900/80" : "bg-emerald-50";
  const progressFill = nightMode ? "bg-emerald-400" : "bg-emerald-500";

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* hidden per-ayah audio element */}
      <audio
        ref={ayahAudioRef}
        src={ayahAudioSrc ?? undefined}
        onEnded={() => setActiveAyahIdx(null)}
      />

      {/* Sticky mini header */}
      <div
        className={`sticky top-0 z-10 mb-1 flex flex-col gap-1 rounded-xl ${stickyHeaderBg} px-3 py-2 text-[11px] shadow-sm backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between gap-3">
          <span>
            Ayah {currentAyah} of {maxAyah}
          </span>
          <span className="hidden text-[10px] text-emerald-600 sm:inline">
            Shift + F to toggle focus
          </span>
        </div>

        {!readingMode && (
          <div
            className={`mt-1 h-1 w-full overflow-hidden rounded-full ${progressBg}`}
          >
            <div
              className={`h-full rounded-full ${progressFill}`}
              style={{
                width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Reading options */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
        <span className="text-gray-700 font-medium">Reading options</span>

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

        <span className="hidden h-4 w-px bg-gray-200 sm:inline-block" />

        <div className="ml-auto flex flex-wrap items-center gap-3 text-xs">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={nightMode}
              onChange={(e) => setNightMode(e.target.checked)}
            />
            <span>Night mode</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={readingMode}
              onChange={(e) => setReadingMode(e.target.checked)}
            />
            <span>Reading mode</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">Font</span>
            <div className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-gray-50">
              {(["sm", "md", "lg"] as FontSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={[
                    "px-2.5 py-1 text-[11px] transition",
                    fontSize === size
                      ? "bg-emerald-500 text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {size === "sm" ? "A-" : size === "md" ? "A" : "A+"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-surah audio block, if provided */}
      {props.audioSrc && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Full surah recitation
          </h3>
          <audio controls className="w-full" src={props.audioSrc} />
          <p className="mt-1 text-[11px] text-gray-400">
            Recitation: Mishary Rashid Alafasy
          </p>
        </div>
      )}

      {/* normal inline page */}
      {!readingMode && <div className="mt-1">{page}</div>}

      {/* fullscreen reading mode */}
      {readingMode && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setReadingMode(false)}
          />
          <div className="relative z-10 flex h-full">
            <div className="mx-auto flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
              <div className="mx-auto max-w-5xl">{page}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
