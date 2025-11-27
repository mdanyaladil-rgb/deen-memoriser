// lib/progress.ts
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export type Mode = "practice" | "drill" | "recall";
export type Hide = "none" | "first-word" | "word" | "full" | "half";

export type SessionResult = {
  id: string;
  at: number; // unix ms
  slug: string;
  name: string;
  number: number;
  range: { start: number; end: number };
  reps: number;
  mode: Mode;
  correct: number;
  total: number;
  percent: number; // 0..100
  attempts: boolean[];

  // NEW (optional) – for analytics only
  focus?: "arabic" | "translit";
  hide?: Hide;
};

const LS_KEY = "qm:sessions:v1";

/* ---------------- Helpers ---------------- */

export function isRecallSession(s: SessionResult): boolean {
  // Treat a session as "real recall" if it:
  //  - had at least one tested item, and
  //  - has a finite percent score
  const hasQuestions = s.total > 0;
  const hasAttempts = Array.isArray(s.attempts) && s.attempts.length > 0;
  const hasScore = Number.isFinite(s.percent);
  return hasScore && (hasQuestions || hasAttempts);
}

/* ---------------- Local fallback ---------------- */
function lsLoad(): SessionResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as SessionResult[]) : [];
  } catch {
    return [];
  }
}
function lsSave(s: SessionResult) {
  if (typeof window === "undefined") return;
  const arr = lsLoad();
  arr.push(s);
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch {}
}

/* ---------------- Public API (Firebase-first) ---------------- */
export async function saveSession(s: SessionResult): Promise<void> {
  const user = auth?.currentUser;
  if (!user || !db) {
    lsSave(s);
    return;
  }
  // users/{uid}/sessions
  const col = collection(db, "users", user.uid, "sessions");
  await addDoc(col, {
    ...s,
    at: Timestamp.fromMillis(s.at),
    createdAt: serverTimestamp(),
    source: "web",
  });
}

export async function loadSessions(): Promise<SessionResult[]> {
  const user = auth?.currentUser;
  if (!user || !db) {
    return lsLoad();
  }
  const col = collection(db, "users", user.uid, "sessions");
  const q = query(col, orderBy("at", "asc"));
  const snap = await getDocs(q);
  const out: SessionResult[] = [];
  snap.forEach((doc) => {
    const d = doc.data() as any;
    const atMs =
      d.at instanceof Timestamp
        ? d.at.toMillis()
        : typeof d.at === "number"
        ? d.at
        : Date.now();
    out.push({
      id: doc.id,
      at: atMs,
      slug: String(d.slug ?? ""),
      name: String(d.name ?? ""),
      number: Number(d.number ?? 0),
      range: d.range ?? { start: 1, end: 1 },
      reps: Number(d.reps ?? 1),
      mode: (d.mode ?? "practice") as any,
      correct: Number(d.correct ?? 0),
      total: Number(d.total ?? 0),
      percent: Number(d.percent ?? 0),
      attempts: Array.isArray(d.attempts) ? (d.attempts as boolean[]) : [],

      // NEW – if missing, they’ll just be undefined
      focus:
        d.focus === "arabic" || d.focus === "translit"
          ? d.focus
          : undefined,
      hide: d.hide as Hide | undefined,
    });
  });
  return out;
}

/* ---------------- Stats helpers ---------------- */
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(d: Date) {
  const day = d.getDay(); // 0..6, Sun=0
  const diff = (day + 6) % 7; // Monday=0
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function calcStreakDays(
  sessions: SessionResult[],
  now = new Date()
): number {
  if (!sessions.length) return 0;
  const days = new Set(
    sessions.map(
      (s) => new Date(new Date(s.at).toDateString()).getTime()
    )
  );
  let streak = 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 0; ; i++) {
    const t = new Date(today.getTime() - i * DAY_MS).getTime();
    if (days.has(t)) streak++;
    else break;
  }
  return streak;
}

export function calcSessionsThisWeek(
  sessions: SessionResult[],
  now = new Date()
): number {
  const start = startOfWeek(now).getTime();
  const end = start + 7 * DAY_MS;
  return sessions.filter((s) => s.at >= start && s.at < end).length;
}

export function calcAverageOfLastN(
  sessions: SessionResult[],
  n = 10
): number | null {
  // Only use *real recall* sessions for the average
  const scored = sessions.filter(isRecallSession);
  if (!scored.length) return null;

  const last = scored.slice(-n);
  const vals = last
    .map((s) => s.percent)
    .filter((p) => Number.isFinite(p));

  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function groupBySurah(
  sessions: SessionResult[]
): Record<
  string,
  {
    slug: string;
    name: string;
    number: number;
    lastScore: number | null;
    lastAt: number | null;
  }
> {
  const map: Record<string, any> = {};

  for (const s of sessions) {
    if (!map[s.slug]) {
      map[s.slug] = {
        slug: s.slug,
        name: s.name,
        number: s.number,
        lastScore: null as number | null,
        lastAt: null as number | null,
      };
    }

    // Only update lastScore/lastAt for actual recall sessions
    if (isRecallSession(s)) {
      const g = map[s.slug];
      if (g.lastAt == null || s.at > g.lastAt) {
        g.lastAt = s.at;
        g.lastScore = s.percent;
      }
    }
  }

  return map;
}

export function fmtPercent(p: number | null): string {
  return p == null ? "—%" : `${p}%`;
}

export function fmtDate(ts: number | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
