"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SURAH_MAP } from "@/data/surahs";

type Focus = "arabic" | "translit";
type Hide = "none" | "half" | "first-word";
type FontSize = "regular" | "large" | "xl" | "xxl";

type LearnStage =
  | "full-surah"
  | "chunk-read"
  | "single-ayah"
  | "chunk-half"
  | "chunk-first-word"
  | "complete";

type LearnState = {
  stage: LearnStage;

  fullReads: number;

  chunkStartIndex: number; // 0-based
  chunkReads: number;

  singleAyahOffset: number;
  singleReads: number;

  halfReads: number;
  firstWordReads: number;
};

const CHUNK_SIZE = 3;
const FULL_REPEATS = 3;
const CHUNK_REPEATS = 3;
const SINGLE_REPEATS = 3;
const HALF_REPEATS = 1;
const FIRSTWORD_REPEATS = 1;

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
 * - Used for the 50% hidden + first-word preview phases
 */
function MaskedAyah({ text, hide }: { text: string; hide: Hide }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || hide === "none") return <>{text}</>;

  return (
    <>
      {words.map((word, i) => {
        let shouldHide = false;

        if (hide === "half") {
          shouldHide = i % 2 === 1; // hide every second word
        } else if (hide === "first-word") {
          shouldHide = i > 0; // show first, hide rest
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

/* ------------------------------------------------------------------ */

export default function GuidedPage() {
  const searchParams = useSearchParams();

  const slug =
    searchParams.get("slug") ??
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("slug")
      : null) ??
    "";

  const surah = slug ? SURAH_MAP[slug] : undefined;

  const [focus, setFocus] = useState<Focus>("arabic");
  const [fontSize, setFontSize] = useState<FontSize>("regular");

  const [translation, setTranslation] = useState<string[]>([]);
  const [transliteration, setTransliteration] = useState<string[]>([]);

  // load extras from /public (same pattern as session page)
  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    async function loadExtras() {
      try {
        const [tRes, tlRes] = await Promise.all([
          fetch(`/translations/en-pickthall/${slug}.json`).catch(() => null),
          fetch(`/transliterations/${slug}.json`).catch(() => null),
        ]);

        const tJson = tRes && tRes.ok ? await tRes.json() : [];
        const tlJson = tlRes && tlRes.ok ? await tlRes.json() : [];

        const tArr = normalizeVerses(tJson);
        const tlArr = normalizeVerses(tlJson);

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
  }, [slug]);

  if (!surah) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Surah not found</h1>
        <p className="text-gray-600 mt-2">
          Please pick a surah again from the practice page.
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

  const ayat = surah.ayat;
  const totalAyat = ayat.length;

  const [learn, setLearn] = useState<LearnState>({
    stage: "full-surah",
    fullReads: 0,
    chunkStartIndex: 0,
    chunkReads: 0,
    singleAyahOffset: 0,
    singleReads: 0,
    halfReads: 0,
    firstWordReads: 0,
  });

  const isDone = learn.stage === "complete";

  const chunkStart = learn.chunkStartIndex;
  const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, totalAyat);
  const chunkLength = chunkEnd - chunkStart;

  const focusedLines =
    focus === "translit" && transliteration.length === totalAyat
      ? transliteration
      : ayat;

  const currentChunkLines = focusedLines.slice(chunkStart, chunkEnd);

  // For translation, show active ayah's translation (if available)
  let activeAyahIndex: number | null = null;
  if (learn.stage === "single-ayah") {
    activeAyahIndex = chunkStart + learn.singleAyahOffset;
  }

  // Stage meta label (top right small tag)
  const stageLabelMap: Record<LearnStage, string> = {
    "full-surah": "Step 1 · Full surah",
    "chunk-read": "Step 2 · Chunk reading",
    "single-ayah": "Step 3 · Ayah focus",
    "chunk-half": "Step 4 · 50% hidden (practice)",
    "chunk-first-word": "Step 5 · First-word cues (practice)",
    complete: "Finished",
  };

  // Font size classes for different modes
  const arabicSize = {
    regular: "text-2xl sm:text-3xl",
    large: "text-3xl sm:text-4xl",
    xl: "text-4xl sm:text-5xl",
    xxl: "text-5xl sm:text-6xl",
  }[fontSize];

  const translitSize = {
    regular: "text-base sm:text-lg",
    large: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
    xxl: "text-2xl sm:text-3xl",
  }[fontSize];

  // Instruction + subtext
  let instruction = "";
  let subInstruction = "";

  if (learn.stage === "full-surah") {
    instruction = `Read the full surah`;
    subInstruction = `Read through from start to end. Read ${
      learn.fullReads + 1
    } of ${FULL_REPEATS}`;
  } else if (learn.stage === "chunk-read") {
    instruction = `Read this group of āyāt`;
    subInstruction = `Chunk ${
      chunkStart / CHUNK_SIZE + 1
    } · Read ${learn.chunkReads + 1} of ${CHUNK_REPEATS}`;
  } else if (learn.stage === "single-ayah") {
    instruction = `Focus on this āyah with context visible`;
    subInstruction = `Within this chunk · Read ${
      learn.singleReads + 1
    } of ${SINGLE_REPEATS}`;
  } else if (learn.stage === "chunk-half") {
    instruction = `Strengthen recall with 50% of the words hidden`;
    subInstruction = `Open a practice session for these āyāt with 50% of words hidden. When you can recite them confidently, come back and continue.`;
  } else if (learn.stage === "chunk-first-word") {
    instruction = `Test yourself with only the first words visible`;
    subInstruction = `Use a practice session with first-word cues only. Once you can recite smoothly, come back and continue.`;
  } else if (learn.stage === "complete") {
    instruction = `Guided session complete 🎉`;
    subInstruction = `You’ve gone through the entire surah with our recommended routine.`;
  }

  const handleNext = () => {
    if (isDone) return;

    setLearn((prev) => {
      const state = { ...prev };

      if (state.stage === "full-surah") {
        state.fullReads += 1;
        if (state.fullReads >= FULL_REPEATS) {
          state.stage = "chunk-read";
          state.chunkStartIndex = 0;
          state.chunkReads = 0;
        }
        return state;
      }

      if (state.stage === "chunk-read") {
        state.chunkReads += 1;
        if (state.chunkReads >= CHUNK_REPEATS) {
          state.stage = "single-ayah";
          state.singleAyahOffset = 0;
          state.singleReads = 0;
        }
        return state;
      }

      if (state.stage === "single-ayah") {
        state.singleReads += 1;
        if (state.singleReads >= SINGLE_REPEATS) {
          if (state.singleAyahOffset + 1 < chunkLength) {
            state.singleAyahOffset += 1;
            state.singleReads = 0;
          } else {
            state.stage = "chunk-half";
            state.halfReads = 0;
          }
        }
        return state;
      }

      if (state.stage === "chunk-half") {
        state.halfReads += 1;
        if (state.halfReads >= HALF_REPEATS) {
          state.stage = "chunk-first-word";
          state.firstWordReads = 0;
        }
        return state;
      }

      if (state.stage === "chunk-first-word") {
        state.firstWordReads += 1;
        if (state.firstWordReads >= FIRSTWORD_REPEATS) {
          const nextStart = state.chunkStartIndex + CHUNK_SIZE;
          if (nextStart >= totalAyat) {
            state.stage = "complete";
          } else {
            state.chunkStartIndex = nextStart;
            state.chunkReads = 0;
            state.singleAyahOffset = 0;
            state.singleReads = 0;
            state.halfReads = 0;
            state.firstWordReads = 0;
            state.stage = "chunk-read";
          }
        }
        return state;
      }

      return state;
    });
  };

  /* --------------------------- Button label --------------------------- */

  let mainButtonLabel = "Next";

  if (learn.stage === "full-surah") {
    const n = learn.fullReads + 1;
    mainButtonLabel =
      n < FULL_REPEATS ? `Mark as read (${n}/${FULL_REPEATS})` : "Mark 3/3 and continue";
  } else if (learn.stage === "chunk-read") {
    const n = learn.chunkReads + 1;
    mainButtonLabel =
      n < CHUNK_REPEATS
        ? `Mark chunk as read (${n}/${CHUNK_REPEATS})`
        : "Chunk read 3/3 · continue";
  } else if (learn.stage === "single-ayah") {
    const n = learn.singleReads + 1;
    mainButtonLabel =
      n < SINGLE_REPEATS
        ? `Mark āyah as read (${n}/${SINGLE_REPEATS})`
        : "Āyah read 3/3 · next";
  } else if (learn.stage === "chunk-half") {
    mainButtonLabel = "I’ve practised 50% hidden · continue";
  } else if (learn.stage === "chunk-first-word") {
    mainButtonLabel = "I’ve practised first-word cues · continue";
  }

  /* --------------------------- Practice links --------------------------- */

  const chunkStartAyahNumber = chunkStart + 1;
  const chunkEndAyahNumber = chunkEnd;

  const halfPracticeHref =
    `/session?slug=${slug}` +
    `&mode=recall&start=${chunkStartAyahNumber}&end=${chunkEndAyahNumber}` +
    `&hide=half&reps=3`;

  const firstWordPracticeHref =
    `/session?slug=${slug}` +
    `&mode=recall&start=${chunkStartAyahNumber}&end=${chunkEndAyahNumber}` +
    `&hide=first-word&reps=3`;

  /* --------------------------- Render --------------------------- */

  if (isDone) {
    return (
      <main className="relative min-h-screen">
        <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-br from-emerald-400 via-teal-400 to-fuchsia-500" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_15%,rgba(255,255,255,0.45),transparent)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.7),rgba(255,255,255,0.95))]" />

        <div className="mx-auto max-w-3xl px-4 py-10 text-center space-y-6">
          <h1 className="text-3xl font-bold mb-2">
            {surah.name} ({surah.arabic})
          </h1>
          <p className="text-lg font-semibold text-emerald-700">
            Guided learning complete ✅
          </p>
          <p className="text-sm text-gray-700 max-w-xl mx-auto">
            You’ve read the surah, drilled it in chunks, practised each āyah
            with context, and strengthened recall using the hidden-word modes.
            Review it again tomorrow or use the other modes to keep it fresh.
          </p>

          <div className="flex justify-center gap-3 pt-4">
            <Link
              href={`/surah/${slug}`}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-white font-semibold hover:bg-emerald-700"
            >
              Back to {surah.name}
            </Link>
            <Link
              href="/practice"
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold hover:bg-gray-50"
            >
              Go to Practice
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      {/* background similar to practice/home */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-br from-emerald-400 via-teal-400 to-fuchsia-500" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_15%,rgba(255,255,255,0.45),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.7),rgba(255,255,255,0.95))]" />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between text-sm text-gray-700">
          <div className="flex items-baseline gap-2">
            <Link
              href="/practice"
              className="text-xs text-emerald-700 hover:underline"
            >
              ← Practice
            </Link>
            <span className="font-semibold">
              {surah.name} ({surah.arabic})
            </span>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
            {stageLabelMap[learn.stage]}
          </span>
        </div>

        {/* Focus + font size controls */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
          <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setFocus("arabic")}
              className={`rounded-full px-4 py-1.5 ${
                focus === "arabic"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-700"
              }`}
            >
              Arabic
            </button>
            <button
              type="button"
              onClick={() => setFocus("translit")}
              className={`rounded-full px-4 py-1.5 ${
                focus === "translit"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-700"
              }`}
            >
              Transliteration
            </button>
          </div>

          <div className="inline-flex rounded-full border border-gray-300 bg-white p-1 items-center gap-1">
            <span className="px-2 text-[10px] uppercase tracking-[0.15em] text-gray-500">
              Font
            </span>
            {(["regular", "large", "xl", "xxl"] as FontSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                className={`rounded-full px-2.5 py-1 ${
                  fontSize === size
                    ? "bg-emerald-600 text-white"
                    : "text-gray-700"
                }`}
              >
                <span
                  className={
                    size === "regular"
                      ? "text-xs"
                      : size === "large"
                      ? "text-sm"
                      : size === "xl"
                      ? "text-base"
                      : "text-lg"
                  }
                >
                  A
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-3xl border border-white/80 bg-white/95 shadow-sm backdrop-blur-sm p-6 sm:p-8 space-y-5">
          {/* Instructions */}
          <div className="space-y-1 text-center">
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              {instruction}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-600">
              {subInstruction}
            </p>
          </div>

          {/* Ayat display */}
          <div className="mt-4 space-y-4">
            {/* Full surah stage */}
            {learn.stage === "full-surah" &&
  focusedLines.map((line, i) => (
    <div
      key={i}
      className="border-b last:border-b-0 border-gray-100 pb-4 last:pb-0"
    >
      <p
        dir={focus === "arabic" ? "rtl" : "ltr"}
        lang={focus === "arabic" ? "ar" : undefined}
        className={`max-w-3xl mx-auto text-center leading-relaxed ${
          focus === "arabic"
            ? `font-arabic ${arabicSize}`
            : `italic ${translitSize}`
        }`}
      >
        {line}
        {/* mushaf-style ayah marker at end of line */}
        <span
          className="
            inline-flex h-7 w-7 items-center justify-center
            rounded-full border border-gray-300 bg-gray-100
            text-[11px] font-semibold text-gray-700
            mx-2 align-middle
          "
        >
          {i + 1}
        </span>
      </p>
    </div>
  ))}


            {/* Chunk-based stages */}
            {learn.stage !== "full-surah" &&
  currentChunkLines.map((line, idx) => {
    const globalIndex = chunkStart + idx;
    const isActive =
      learn.stage === "single-ayah" &&
      idx === learn.singleAyahOffset;

    let hide: Hide = "none";
    if (learn.stage === "chunk-half") hide = "half";
    if (learn.stage === "chunk-first-word") hide = "first-word";

    const content =
      hide === "none" ? (
        line
      ) : (
        <MaskedAyah text={line} hide={hide} />
      );

    return (
      <div
        key={globalIndex}
        className={`border-b last:border-b-0 border-gray-100 pb-4 last:pb-0 ${
          isActive
            ? "bg-emerald-50/60 rounded-2xl px-3 py-3"
            : "px-1 pt-1"
        }`}
      >
        <p
          dir={focus === "arabic" ? "rtl" : "ltr"}
          lang={focus === "arabic" ? "ar" : undefined}
          className={`max-w-3xl mx-auto text-center leading-relaxed ${
            focus === "arabic"
              ? `font-arabic ${arabicSize}`
              : `italic ${translitSize}`
          } ${
            isActive ? "text-emerald-900" : "text-gray-800"
          }`}
        >
          {content}
          {/* mushaf-style ayah marker at end of line */}
          <span
            className="
              inline-flex h-7 w-7 items-center justify-center
              rounded-full border border-gray-300 bg-gray-100
              text-[11px] font-semibold text-gray-700
              mx-2 align-middle
            "
          >
            {globalIndex + 1}
          </span>
        </p>
      </div>
    );
  })}

          </div>

          {/* Translation of active ayah in single-ayah stage */}
          {activeAyahIndex != null &&
            translation[activeAyahIndex] &&
            learn.stage === "single-ayah" && (
              <div className="mt-4 max-w-3xl mx-auto rounded-xl bg-gray-50 px-4 py-3 text-xs sm:text-sm text-gray-700 text-center">
                {translation[activeAyahIndex]}
              </div>
            )}

          {/* Practice prompts when in 50% / first-word stages */}
          {(learn.stage === "chunk-half" ||
            learn.stage === "chunk-first-word") && (
            <div className="mt-4 max-w-3xl mx-auto rounded-xl bg-emerald-50 px-4 py-3 text-[11px] sm:text-xs text-emerald-900 space-y-2 text-center">
              <p className="font-semibold">
                Step into active recall for āyāt {chunkStartAyahNumber}–
                {chunkEndAyahNumber}.
              </p>
              <p>
                We’ll open a separate practice session with the right hide mode.
                Use it until these āyāt feel fluent, then come back here and
                press the continue button below.
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 pb-10">
          {learn.stage === "chunk-half" && (
            <Link
              href={halfPracticeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-50"
            >
              Open 50% hidden practice in new tab
            </Link>
          )}

          {learn.stage === "chunk-first-word" && (
            <Link
              href={firstWordPracticeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-50"
            >
              Open first-word practice in new tab
            </Link>
          )}

          <button
            onClick={handleNext}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            {mainButtonLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
