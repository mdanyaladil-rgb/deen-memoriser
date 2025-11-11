// app/practice/redirect/route.ts
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || "al-ikhlas";

  const params = new URLSearchParams();
  const mode = url.searchParams.get("mode") || "practice";
  const start = url.searchParams.get("start") || "1";
  const end = url.searchParams.get("end") || "5";
  const hide = url.searchParams.get("hide") || "none";
  const reps = url.searchParams.get("reps") || "3";

  params.set("mode", mode);
  params.set("start", start);
  params.set("end", end);
  params.set("hide", hide);
  params.set("reps", reps);

  return NextResponse.redirect(new URL(`/surah/${slug}?${params.toString()}`, url.origin));
}
