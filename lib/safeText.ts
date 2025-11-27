// lib/safeText.ts

/** Deeply extract a string from ANY value:
 *  - string → string
 *  - array  → join of element strings
 *  - object → prefer common fields; else first non-empty string found
 */
function toStr(v: unknown): string {
  if (typeof v === "string") return v;

  if (Array.isArray(v)) {
    const parts = v.map(toStr).filter(Boolean);
    return parts.join(" ");
  }

  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;

    // common field names we might see
    const candidates = [
      "text", "content", "value", "translation", "transliteration",
      "en", "en_pickthall", "line", "t", "v"
    ];

    for (const k of candidates) {
      if (k in o) {
        const s = toStr(o[k]);
        if (s) return s;
      }
    }

    // fallback: first non-empty string anywhere in the object
    for (const val of Object.values(o)) {
      const s = toStr(val);
      if (s) return s;
    }
  }

  return "";
}

/** Normalise many possible shapes to a plain string[] in verse order:
 *  - ["v1","v2", ...]
 *  - {"1":"v1","2":"v2", ...}
 *  - { ayahs: {...} } / { ayat: {...} } / { verses: [...] } / { data: ... }
 *  - values can be strings OR objects with text/content/etc.
 */
export function normalizeVerses(input: unknown): string[] {
  let x: unknown = input;

  // unwrap common containers
  if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;
    for (const key of ["ayahs", "ayat", "verses", "data", "items"]) {
      if (key in o) {
        x = o[key] as unknown;
        break;
      }
    }
  }

  // array → map deeply
  if (Array.isArray(x)) return x.map(toStr);

  // object with numeric-ish keys → order by number
  if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;
    const keys = Object.keys(o);

    // prefer numeric keys if present
    const numKeys = keys.filter((k) => /^\s*\d+\s*$/.test(k));
    if (numKeys.length) {
      return numKeys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => toStr(o[k]));
    }

    // otherwise: preserve insertion order
    return keys.map((k) => toStr(o[k]));
  }

  return [];
}

/** For rare UI use; not needed in SurahReader now */
export function textify(v: unknown): string {
  return typeof v === "string" ? v : "";
}
