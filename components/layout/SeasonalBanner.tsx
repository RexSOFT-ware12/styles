"use client";

import { daysToChristmas } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";
import { ArrowRight, CalendarHeart, Check, Copy, Gift, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Theme = {
  label: string;
  headline: string;
  fallback: string;
  Icon: typeof Zap;
  /** Base background + the three glowing blobs behind the content. */
  base: string;
  blobs: [string, string, string];
  accent: string;
  button: string;
};

function themeFor(season: "blackfriday" | "christmas" | "holiday", title: string): Theme {
  if (season === "blackfriday") {
    return {
      label: "Black Friday",
      headline: "Black Friday deals are here",
      fallback: "Garment files and patterns on sale, plus bigger bundle savings. This week only.",
      Icon: Zap,
      base: "bg-neutral-950",
      blobs: ["bg-amber-500/40", "bg-fuchsia-600/35", "bg-orange-600/40"],
      accent: "from-amber-300 via-orange-400 to-fuchsia-400",
      button: "bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 hover:from-amber-300 hover:to-orange-400",
    };
  }
  if (season === "christmas") {
    const days = daysToChristmas();
    return {
      label: "Holiday Sale",
      headline: days > 0 ? `${days} day${days === 1 ? "" : "s"} to Christmas` : "Merry Christmas",
      fallback: "Grab a gift for a designer. Instant download, ready in CLO3D.",
      Icon: Gift,
      base: "bg-[#06140f]",
      blobs: ["bg-red-600/40", "bg-emerald-500/35", "bg-amber-400/25"],
      accent: "from-red-300 via-amber-200 to-emerald-300",
      button: "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-400 hover:to-rose-400",
    };
  }
  return {
    label: title || "Public holiday",
    headline: `Happy ${title || "holiday"}`,
    fallback: "Instant downloads still work as normal.",
    Icon: CalendarHeart,
    base: "bg-[#140b02]",
    blobs: ["bg-amber-500/40", "bg-orange-600/35", "bg-rose-500/25"],
    accent: "from-amber-200 via-orange-300 to-rose-300",
    button: "bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 hover:from-amber-300 hover:to-orange-400",
  };
}

function useCountdown(endsAt: string | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!endsAt) return setLeft(null);
    const end = new Date(endsAt).getTime();
    if (Number.isNaN(end)) return setLeft(null);
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return { done: left <= 0, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Big sitewide promo banner for the theme the admin switched on (Black
 * Friday, Christmas or a public holiday), with a live countdown, the
 * coupon code and a close button. Closing it hides this campaign for good
 * on that browser; a new campaign (different theme, message or code) shows again.
 */
export default function SeasonalBanner() {
  const info = useSeason();
  const { season } = info;
  const [hidden, setHidden] = useState(true);
  const [copied, setCopied] = useState(false);
  const key = `fn_promo_closed_${season}_${info.message}_${info.code}`;
  const time = useCountdown(info.endsAt);

  useEffect(() => {
    try { setHidden(localStorage.getItem(key) === "1"); } catch { setHidden(false); }
  }, [key]);

  if (!season || hidden || time?.done) return null;

  const t = themeFor(season, info.title);
  const close = () => {
    setHidden(true);
    try { localStorage.setItem(key, "1"); } catch { /* storage off: closes for this page view */ }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(info.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* the code is on screen anyway */ }
  };

  return (
    <section
      aria-label={`${t.label} promotion`}
      className={`relative z-[55] isolate overflow-hidden text-white ${t.base} motion-safe:animate-[promo-in_0.5s_ease-out]`}
    >
      {/* Glow blobs, fine grid and a moving sheen */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className={`absolute -left-20 -top-24 h-72 w-72 rounded-full blur-3xl ${t.blobs[0]} motion-safe:animate-[promo-drift_14s_ease-in-out_infinite]`} />
        <div className={`absolute left-1/2 -bottom-32 h-80 w-80 rounded-full blur-3xl ${t.blobs[1]} motion-safe:animate-[promo-drift_18s_ease-in-out_infinite_reverse]`} />
        <div className={`absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl ${t.blobs[2]} motion-safe:animate-[promo-drift_16s_ease-in-out_infinite]`} />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent motion-safe:animate-[promo-sheen_6s_ease-in-out_infinite]" />
      </div>

      <div className="container mx-auto flex flex-col gap-5 px-5 py-6 pr-14 sm:px-8 sm:py-8 sm:pr-20 lg:pr-24 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <t.Icon className="h-3.5 w-3.5" aria-hidden />
            {t.label} · Live now
          </span>
          <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            <span className={`bg-gradient-to-r ${t.accent} bg-clip-text text-transparent`}>{t.headline}</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/75 sm:text-base">{info.message || t.fallback}</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center lg:flex-col lg:items-end">
          {time && (
            <div className="flex gap-2" role="timer" aria-label={`Ends in ${time.d} days ${time.h} hours ${time.m} minutes`}>
              {([["Days", time.d], ["Hrs", time.h], ["Min", time.m], ["Sec", time.s]] as const).map(([l, v]) => (
                <div key={l} className="min-w-[58px] rounded-xl border border-white/15 bg-white/10 px-2 py-2 text-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                  <div className="font-mono text-xl font-bold tabular-nums sm:text-2xl">{pad(v)}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/60">{l}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {info.code && (
              <button
                type="button"
                onClick={copy}
                aria-label={`Copy code ${info.code}`}
                className="group inline-flex items-center gap-2 rounded-full border border-dashed border-white/40 bg-white/5 px-4 py-2.5 font-mono text-sm font-bold tracking-wider hover:bg-white/10"
              >
                {info.code}
                {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4 opacity-70 group-hover:opacity-100" />}
                <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
              </button>
            )}
            {season !== "holiday" && (
              <Link
                href="/shop?onSale=true"
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5 ${t.button}`}
              >
                Shop the sale <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Close promotion"
        onClick={close}
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition hover:rotate-90 hover:bg-white/20 sm:right-5 sm:top-5"
      >
        <X className="h-4 w-4" />
      </button>
    </section>
  );
}
