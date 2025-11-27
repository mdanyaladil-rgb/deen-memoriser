import fs from "fs/promises";
import path from "path";

// Normalise any of these shapes into a string[]
// - ["v1", "v2", ...]
// - { ayahs: { "1": "v1", "2": "v2", ... } }
// - [ { ayahs: { "1": "v1", ... } } ]
// - { "1": "v1", "2": "v2", ... }
function normalizeAyahs(data: any): string[] {
  if (!data) return [];

  // Case 1: already an array
  if (Array.isArray(data)) {
    // Special case: [ { ayahs: {...} } ]
    if (
      data.length === 1 &&
      data[0] &&
      typeof data[0] === "object" &&
      "ayahs" in (data[0] as any)
    ) {
      return normalizeAyahs((data[0] as any).ayahs);
    }

    // If it's just an array of strings (or things we can stringify)
    return data.map((v) =>
      typeof v === "string" ? v : v == null ? "" : String(v)
    );
  }

  // Case 2: object with "ayahs" field (your JSON shape for extras)
  if (typeof data === "object" && data !== null) {
    if ("ayahs" in (data as any) && typeof (data as any).ayahs === "object") {
      const ayahsObj = (data as any).ayahs as Record<string, any>;
      return Object.keys(ayahsObj)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => {
          const v = ayahsObj[k];
          return typeof v === "string" ? v : v == null ? "" : String(v);
        });
    }

    // Case 3: object keyed directly by verse numbers: { "1": "v1", "2": "v2", ... }
    const keys = Object.keys(data);
    if (keys.every((k) => !Number.isNaN(Number(k)))) {
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => {
          const v = (data as any)[k];
          return typeof v === "string" ? v : v == null ? "" : String(v);
        });
    }

    // Fallback: just grab all string values
    return Object.values(data)
      .filter((v) => typeof v === "string")
      .map((v) => v as string);
  }

  return [];
}

export async function loadSurahExtras(slug: string) {
  try {
    const transPath = path.join(
      process.cwd(),
      "public",
      "translations",
      "en-pickthall",
      `${slug}.json`
    );
    const translitPath = path.join(
      process.cwd(),
      "public",
      "transliterations",
      `${slug}.json`
    );

    const [translationRaw, transliterationRaw] = await Promise.all([
      fs.readFile(transPath, "utf8").catch(() => "[]"),
      fs.readFile(translitPath, "utf8").catch(() => "[]"),
    ]);

    const translationJson = JSON.parse(translationRaw);
    const transliterationJson = JSON.parse(transliterationRaw);

    const translation = normalizeAyahs(translationJson);
    const transliteration = normalizeAyahs(transliterationJson);

    return { translation, transliteration };
  } catch (err) {
    console.error("Failed to load surah extras", err);
    return { translation: [], transliteration: [] };
  }
}
