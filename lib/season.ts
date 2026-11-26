export type Season = "blackfriday" | "christmas" | "holiday" | null;

/**
 * Which seasonal theme is active. Date-driven so nothing has to be switched on
 * or off by hand. Preview any theme with ?season=blackfriday or ?season=christmas
 * (or ?season=off) on any page.
 *
 *   Black Friday  — 20 Nov to 30 Nov (includes Cyber Monday)
 *   Christmas     — 1 Dec to 26 Dec (snow on the landing page)
 */
export function getSeason(now: Date = new Date(), override?: string | null): Season {
  if (override === "blackfriday" || override === "christmas") return override;
  if (override === "off") return null;
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if (m === 11 && d >= 20) return "blackfriday";
  if (m === 12 && d <= 26) return "christmas";
  return null;
}

/** Days until 25 December, never negative. */
export function daysToChristmas(now: Date = new Date()): number {
  const xmas = new Date(now.getFullYear(), 11, 25);
  return Math.max(0, Math.ceil((xmas.getTime() - now.getTime()) / 86_400_000));
}
