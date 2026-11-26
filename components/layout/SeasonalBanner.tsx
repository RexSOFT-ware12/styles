"use client";

import { daysToChristmas, getSeason, type Season } from "@/lib/season";
import { Gift, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Optional: create the coupon in the admin dashboard, then set this env var so
// the banner shows the code. Without it the banner just points at the sale.
const CODE = process.env.NEXT_PUBLIC_SEASON_CODE;

/** Thin sitewide strip for Black Friday / Christmas. Renders nothing off-season. */
export default function SeasonalBanner() {
  const [season, setSeason] = useState<Season>(null);
  const [days, setDays] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const override = new URLSearchParams(window.location.search).get("season");
    const s = getSeason(new Date(), override);
    setSeason(s);
    setDays(daysToChristmas());
    try {
      setHidden(sessionStorage.getItem(`fn_season_${s}`) === "1");
    } catch {}
  }, []);

  if (!season || hidden) return null;
  const bf = season === "blackfriday";

  return (
    <div
      className={`relative z-[55] text-center text-sm font-medium px-10 py-2 ${
        bf ? "bg-neutral-950 text-white" : "bg-gradient-to-r from-red-700 via-red-600 to-emerald-700 text-white"
      }`}
    >
      <Link href="/shop?onSale=true" className="inline-flex flex-wrap items-center justify-center gap-x-2 hover:underline">
        {bf ? <Zap className="h-4 w-4 text-yellow-300" aria-hidden /> : <Gift className="h-4 w-4" aria-hidden />}
        <span className="font-bold tracking-wide">{bf ? "BLACK FRIDAY SALE" : "HOLIDAY SALE"}</span>
        <span>
          {bf
            ? "Patterns on sale and bigger bundle savings, this week only."
            : days > 0
              ? `${days} day${days === 1 ? "" : "s"} to Christmas. Grab a gift for a designer.`
              : "Merry Christmas from FabricNow!"}
        </span>
        {CODE && <span className="rounded bg-white/15 px-2 py-0.5 font-mono text-xs">Code {CODE}</span>}
        <span className="underline">Shop the sale</span>
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem(`fn_season_${season}`, "1");
          } catch {}
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/15"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
