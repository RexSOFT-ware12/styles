"use client";

import { daysToChristmas } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";
import { CalendarHeart, Gift, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Thin sitewide strip for the theme the admin switched on (Black Friday,
 * Christmas or a public holiday). Renders nothing when no theme is active.
 */
export default function SeasonalBanner() {
  const info = useSeason();
  const { season } = info;
  const [hidden, setHidden] = useState(false);
  const key = `fn_season_${season}_${info.message}`;

  useEffect(() => {
    try { setHidden(sessionStorage.getItem(key) === "1"); } catch {}
  }, [key]);

  if (!season || hidden) return null;
  const days = daysToChristmas();
  const style =
    season === "blackfriday" ? "bg-neutral-950 text-white"
    : season === "christmas" ? "bg-gradient-to-r from-red-700 via-red-600 to-emerald-700 text-white"
    : "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
  const label = season === "blackfriday" ? "BLACK FRIDAY SALE" : season === "christmas" ? "HOLIDAY SALE" : (info.title || "Public holiday").toUpperCase();
  const fallback =
    season === "blackfriday" ? "Patterns on sale and bigger bundle savings, this week only."
    : season === "christmas" ? (days > 0 ? `${days} day${days === 1 ? "" : "s"} to Christmas. Grab a gift for a designer.` : "Merry Christmas from FabricNow!")
    : "Instant downloads still work as normal.";
  const Icon = season === "blackfriday" ? Zap : season === "christmas" ? Gift : CalendarHeart;

  return (
    <div className={`relative z-[55] text-center text-sm font-medium px-10 py-2 ${style}`}>
      <Link href="/shop?onSale=true" className="inline-flex flex-wrap items-center justify-center gap-x-2 hover:underline">
        <Icon className="h-4 w-4" aria-hidden />
        <span className="font-bold tracking-wide">{label}</span>
        <span>{info.message || fallback}</span>
        {info.code && <span className="rounded bg-white/15 px-2 py-0.5 font-mono text-xs">Code {info.code}</span>}
        {season !== "holiday" && <span className="underline">Shop the sale</span>}
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => { setHidden(true); try { sessionStorage.setItem(key, "1"); } catch {} }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/15"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
