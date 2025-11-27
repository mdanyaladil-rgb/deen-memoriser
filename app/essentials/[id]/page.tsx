// app/essentials/[id]/page.tsx
import Link from "next/link";
import { KEY_AYAT } from "@/data/keyAyat";
import AyahActionsClient from "./AyahActionsClient";

export default function EssentialAyahPage({
  params,
}: {
  params: { id: string };
}) {
  const ayah = KEY_AYAT.find((x) => x.id === params.id);

  // Soft not-found
  if (!ayah) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="mb-4 text-sm text-slate-500">
          This ayah isn’t in Qur’an Essentials (yet).
        </p>
        <Link
          href="/essentials"
          className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600"
        >
          Back to Qur’an Essentials
        </Link>
      </main>
    );
  }

  const useLine =
    ayah.useTags.length > 0 ? ayah.useTags.join(" · ") : "General reminder";

  const copyText = [
    ayah.arabic && ayah.arabic.trim().length > 0 ? ayah.arabic : null,
    ayah.transliteration && ayah.transliteration.trim().length > 0
      ? ayah.transliteration
      : null,
    `"${ayah.translation}"`,
    ayah.surahRef,
    ayah.useTags.length > 0
      ? `Use this ayah when talking about: ${ayah.useTags.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-600">
          Home
        </Link>
        <span>›</span>
        <Link href="/essentials" className="hover:text-emerald-600">
          Qur’an Essentials
        </Link>
        <span>›</span>
        <span className="font-medium text-slate-700 line-clamp-1">
          {ayah.label}
        </span>
      </div>

      {/* Heading */}
      <header className="mb-6 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
            {ayah.surahRef}
          </p>
          <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
            Qur’an Essentials
          </p>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {ayah.label}
        </h1>
        <p className="text-sm text-slate-600">{ayah.tagline}</p>
      </header>

      {/* Knowledge Card */}
      <section className="mb-6 rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/80 via-white to-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-medium text-emerald-700">
            Qur’anic ayah (reference-friendly)
          </span>
        </div>

        <div className="space-y-4">
          {/* Arabic placeholder */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
              Arabic text
            </p>
            <p className="mt-2 text-xs text-emerald-900">
              We’ll pull the exact Arabic from your main Qur’an data here to
              keep it 100% accurate, inshaAllah.
            </p>
          </div>

          {/* Translation */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              Translation
            </p>
            <p className="mt-2 text-sm text-slate-900">{ayah.translation}</p>
          </div>

          {/* Use tags */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              Use this ayah when talking about
            </p>
            <p className="mt-2 text-xs text-slate-800">{useLine}</p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="mb-8">
        <AyahActionsClient copyText={copyText} />
      </section>

      {/* Context + Reminder */}
      <section className="space-y-4 text-sm">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            Why this ayah is useful to quote
          </h2>
          <p className="text-sm text-slate-700">{ayah.quickContext}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Quick reminder idea
          </h2>
          <p className="text-sm text-emerald-900">
            You can use this ayah in a WhatsApp reminder, a short talk, or a
            one-to-one conversation when discussing{" "}
            {ayah.useTags.slice(0, 3).join(", ")}.
          </p>
        </div>
      </section>
    </main>
  );
}
