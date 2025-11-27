// data/keyAyat.ts

export type KeyAyahCategory =
  | "protection"
  | "positivity"
  | "tawakkul"
  | "character"
  | "discipline"
  | "dua";

export type KeyAyahMeta = {
  id: string; // used in the UI / future routes
  label: string; // short title
  surahRef: string; // e.g. "Ash-Sharh 94:5–6"
  category: KeyAyahCategory;
  tagline: string; // 1-line explanation

  // What shows on the card
  arabic: string;
  transliteration: string;
  translation: string;

  // Extra knowledge bits (can be used later)
  quickContext: string;
  useTags: string[];
};

export const KEY_AYAT: KeyAyahMeta[] = [
  {
    id: "with-hardship-ease",
    label: "With hardship comes ease",
    surahRef: "Ash-Sharh 94:5–6",
    category: "positivity",
    tagline: "A reminder that no hardship exists alone – ease walks with it.",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    transliteration:
      "Fa-inna ma'a al-'usri yusra. Inna ma'a al-'usri yusra.",
    translation:
      "For indeed, with hardship comes ease. Indeed, with hardship comes ease.",
    quickContext:
      "Use this ayah when comforting someone going through difficulty. It reminds us that ease is paired with hardship, not something that only comes years later.",
    useTags: ["hardship", "patience", "hope", "Allah's mercy"],
  },
  {
    id: "ayat-al-kursi",
    label: "Ayat al-Kursi",
    surahRef: "Al-Baqarah 2:255",
    category: "protection",
    tagline:
      "One of the greatest ayat of the Qur’an, recited for protection and recognising Allah’s greatness.",
    arabic:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ...",
    transliteration:
      "Allahu la ilaha illa Huwa, al-Hayyul-Qayyum...",
    translation:
      "Allah – there is no deity except Him, the Ever-Living, the Sustainer of [all] existence...",
    quickContext:
      "Use this when speaking about Allah’s oneness, His knowledge, and His protection. Commonly recited after prayers and before sleep for protection.",
    useTags: [
      "tawhid",
      "protection",
      "Allah's knowledge",
      "before sleep",
      "dhikr",
    ],
  },
  {
    id: "allah-does-not-burden",
    label: "No soul burdened beyond its scope",
    surahRef: "Al-Baqarah 2:286",
    category: "positivity",
    tagline: "Allah knows your capacity and does not burden you beyond it.",
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ...",
    transliteration: "La yukallifu Allahu nafsan illa wus'aha...",
    translation:
      "Allah does not charge a soul except with that within its capacity.",
    quickContext:
      "Use this when reassuring someone who feels overwhelmed or tested. It shows that Allah knows what you can handle and never wrongs anyone.",
    useTags: ["tests", "coping", "fairness", "Allah's justice", "patience"],
  },
  {
    id: "remember-me",
    label: "Remember Me, I will remember you",
    surahRef: "Al-Baqarah 2:152",
    category: "discipline",
    tagline: "Dhikr and salah as your anchor in daily life.",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    transliteration:
      "Fadhkuruni adhkurkum washkuruli wa la takfurun.",
    translation:
      "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    quickContext:
      "Use this when encouraging dhikr, salah, and gratitude. It shows that remembering Allah is honoured by Allah remembering the servant.",
    useTags: ["dhikr", "gratitude", "salah", "connection to Allah"],
  },
  {
    id: "whoever-relies-on-allah",
    label: "Whoever relies on Allah",
    surahRef: "At-Talaq 65:3",
    category: "tawakkul",
    tagline: "Put your trust in Allah and He will be enough for you.",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    transliteration:
      "Wa man yatawakkal 'ala Allahi fa-huwa hasbuhu.",
    translation:
      "And whoever relies upon Allah – then He is sufficient for him.",
    quickContext:
      "Use this when talking about trust in Allah, especially around big decisions, anxiety about rizq, and fear of the future.",
    useTags: ["tawakkul", "rizq", "anxiety", "fear of future"],
  },
  {
    id: "speak-good-words",
    label: "Speak good to people",
    surahRef: "Al-Baqarah 2:83",
    category: "character",
    tagline: "Good speech as the default setting of a believer.",
    arabic: "وَقُولُوا لِلنَّاسِ حُسْنًا",
    transliteration: "Wa qulu lin-nasi husna.",
    translation: "And speak to people good [words].",
    quickContext:
      "Use this when reminding about manners, online behaviour, family arguments, or how Muslims should speak in society.",
    useTags: ["manners", "speech", "character", "online behaviour"],
  },
  {
    id: "our-lord-give-us-good",
    label: "Rabbana atina fid-dunya hasanah",
    surahRef: "Al-Baqarah 2:201",
    category: "dua",
    tagline: "A concise du’a for success in this world and the next.",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration:
      "Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina 'adhab an-nar.",
    translation:
      "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
    quickContext:
      "Use this when talking about balanced goals: dunya and akhirah. It’s a famous du’a often recited in salah and general supplication.",
    useTags: ["dua", "balance", "dunya and akhirah", "goals"],
  },
];
