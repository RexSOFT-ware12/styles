"use client";

import { getSeason, type Season } from "@/lib/season";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type SeasonInfo = {
  season: Season | "holiday";
  title: string;
  message: string;
  code: string;
  snow: boolean;
  /** ISO time the sale ends (admin's end date or the calendar window); null when open-ended. */
  endsAt: string | null;
};

/** End of the automatic calendar window, used when the backend can't say. */
function calendarEnd(season: SeasonInfo["season"]): string | null {
  const y = new Date().getFullYear();
  if (season === "blackfriday") return new Date(y, 11, 1).toISOString();
  if (season === "christmas") return new Date(y, 11, 27).toISOString();
  return null;
}

const OFF: SeasonInfo = { season: null, title: "", message: "", code: "", snow: false, endsAt: null };
let pending: Promise<SeasonInfo> | null = null;

/** The admin's theme choice, fetched once per page load and shared. */
function load(): Promise<SeasonInfo> {
  if (!pending) {
    pending = fetch(`${API_BASE}/season`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => ({ ...OFF, ...d }) as SeasonInfo)
      // Backend unreachable: fall back to the calendar so the site still themes itself.
      .catch(() => {
        const s = getSeason();
        return { ...OFF, season: s, snow: s === "christmas", endsAt: calendarEnd(s) };
      });
  }
  return pending;
}

/**
 * `?season=blackfriday|christmas|holiday|off` on the URL previews a theme
 * without touching the admin setting.
 */
export function useSeason(): SeasonInfo {
  const [info, setInfo] = useState<SeasonInfo>(OFF);
  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get("season");
    if (o === "blackfriday" || o === "christmas" || o === "holiday") {
      setInfo({ ...OFF, season: o, title: o === "holiday" ? "Public holiday" : "", snow: o === "christmas", endsAt: calendarEnd(o) });
      return;
    }
    if (o === "off") return;
    let alive = true;
    load().then((i) => alive && setInfo(i));
    return () => { alive = false; };
  }, []);
  return info;
}
