// app/essentials/[id]/AyahActionsClient.tsx
"use client";

import { useState } from "react";

export default function AyahActionsClient({
  copyText,
}: {
  copyText: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy ayah:", err);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-600"
        type="button"
      >
        Start memorising (coming soon)
      </button>

      <button
        onClick={handleCopy}
        type="button"
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-emerald-400"
      >
        {copied ? "Copied!" : "Copy ayah & reference"}
      </button>

      <button
        type="button"
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-emerald-400"
      >
        Share as card (soon)
      </button>
    </div>
  );
}
