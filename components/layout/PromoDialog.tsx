"use client";

import PinterestIcon from "@/components/pinterest/PinterestIcon";
import { loadPinterestSettings } from "@/lib/pinterest";
import { daysToChristmas } from "@/lib/season";
import { useSeason } from "@/lib/useSeason";
import { ArrowRight, Check, Copy, ShieldCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Pages where a sale pop-up would get in the way of finishing something. */
const QUIET = ["/checkout", "/cart", "/signin", "/signup", "/account", "/welcome"];
const OPEN_DELAY_MS = 2500;

type Theme = {
  label: string;
  title: string;
  subtitle: string;
  glow: string;
  line: string;
  button: string;
  ring: string;
  dot: string;
};

function themeFor(season: "blackfriday" | "christmas" | "holiday", holiday: string): Theme {
  if (season === "christmas") {
    const days = daysToChristmas();
    return {
      label: "Holiday sale",
      title: days > 0 ? `${days} day${days === 1 ? "" : "s"} to Christmas` : "Merry Christmas",
      subtitle: "Grab a gift for a designer. Instant download, ready in CLO3D.",
      glow: "from-red-600/40 via-emerald-700/25 to-transparent",
      line: "#f87171",
      button: "from-red-500 to-rose-600",
      ring: "border-red-400/60 bg-red-500/10",
      dot: "border-red-400 text-red-400",
    };
  }
  if (season === "holiday") {
    return {
      label: holiday || "Public holiday",
      title: `Happy ${holiday || "holiday"}`,
      subtitle: "Instant downloads still work as normal.",
      glow: "from-amber-500/40 via-orange-700/25 to-transparent",
      line: "#fb923c",
      button: "from-amber-400 to-orange-500",
      ring: "border-orange-400/60 bg-orange-500/10",
      dot: "border-orange-400 text-orange-400",
    };
  }
  return {
    label: "Black Friday",
    title: "Black Friday is on",
    subtitle: "Garment files and patterns on sale, plus bigger bundle savings. This week only.",
    glow: "from-fuchsia-700/40 via-orange-700/25 to-transparent",
    line: "#fb923c",
    button: "from-orange-400 to-orange-600",
    ring: "border-orange-400/60 bg-orange-500/10",
    dot: "border-orange-400 text-orange-400",
  };
}

function useCountdown(endsAt: string | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = endsAt ? new Date(endsAt).getTime() : NaN;
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

/** Decorative garment pattern pieces drawn in the theme colour, like a CLO3D 2D window. */
function PatternArt({ color }: { color: string }) {
  const piece = (x: number, y: number, flip = false) => (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1 1) translate(-64 0)" : ""}`}>
      <path d="M8 4 Q32 -2 56 4 L62 84 Q32 90 2 84 Z" fill="rgba(255,255,255,0.04)" stroke={color} strokeWidth="2" />
      <path d="M12 10 Q32 5 52 10 L57 78 Q32 83 7 78 Z" fill="none" stroke={color} strokeOpacity="0.5" strokeDasharray="3 3" />
      <line x1="32" y1="22" x2="32" y2="66" stroke="#e5e7eb" strokeOpacity="0.6" strokeWidth="1.5" />
    </g>
  );
  return (
    <svg viewBox="0 0 160 200" className="h-full w-full" aria-hidden>
      <g className="motion-safe:animate-[promo-float_6s_ease-in-out_infinite]">
        {piece(10, 6)}
        {piece(86, 6, true)}
      </g>
      <g className="motion-safe:animate-[promo-float_6s_ease-in-out_infinite_-3s]" opacity="0.85">
        {piece(14, 108)}
        {piece(82, 108, true)}
      </g>
    </svg>
  );
}

/**
 * Sale pop-up for the theme the admin switched on (Black Friday, Christmas or
 * a public holiday). Opens a moment after the first page load, never on
 * checkout/cart/sign-in pages, and once closed stays closed for that
 * campaign; a new campaign (different theme, message or code) shows again.
 */
export default function PromoDialog() {
  const info = useSeason();
  const { season } = info;
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pinProfile, setPinProfile] = useState("");
  const time = useCountdown(info.endsAt);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const key = `fn_promo_closed_${season}_${info.message}_${info.code}`;
  const quiet = QUIET.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (!season || quiet || time?.done) return;
    try { if (localStorage.getItem(key) === "1") return; } catch { /* storage off: still show once */ }
    const id = setTimeout(() => {
      lastFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    }, OPEN_DELAY_MS);
    return () => clearTimeout(id);
    // time?.done flips once; the rest identify the campaign/page.
  }, [season, key, quiet, time?.done]);

  useEffect(() => {
    if (!open) return;
    loadPinterestSettings().then((s) => setPinProfile(s.profileUrl));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !season) return null;

  function close() {
    setOpen(false);
    try { localStorage.setItem(key, "1"); } catch { /* ignore */ }
    lastFocus.current?.focus?.();
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(info.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* code is on screen */ }
  };

  const t = themeFor(season, info.title);
  const rows: [string, string, string][] = [
    ["Garment files", "Full price", "On sale"],
    ["Coupon code", "–", info.code || "Not needed"],
    ["Bundle savings", "Standard", "Bigger"],
    ["Download", "Instant", "Instant"],
    ["Re-downloads", "Free", "Free"],
  ];
  const perks = [
    "Ready-to-use CLO3D .zprj files",
    "Instant download after payment",
    "Free re-downloads from My Purchases",
    info.code ? `Use ${info.code} at checkout` : "Sale prices already applied",
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm motion-safe:animate-[promo-fade_0.25s_ease-out]" onClick={close} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#141322] text-white shadow-2xl motion-safe:animate-[promo-pop_0.35s_cubic-bezier(.2,.9,.3,1.2)] sm:rounded-3xl md:grid-cols-2"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:rotate-90 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left: art, headline, then-vs-now table */}
        <div className="relative isolate overflow-hidden px-6 pb-6 pt-8 sm:px-8">
          <div aria-hidden className={`absolute inset-0 -z-10 bg-gradient-to-br ${t.glow}`} />
          <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />

          <div className="relative mx-auto h-36 w-32 sm:h-44 sm:w-40">
            <PatternArt color={t.line} />
          </div>
          <div className="relative -mt-6 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-orange-400 motion-safe:animate-pulse" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{t.label} · live now</div>
              <div className="truncate text-xs text-white/50">CLO3D garments, fabrics &amp; patterns</div>
            </div>
            <Sparkles className="h-4 w-4 text-orange-300" />
          </div>

          <h2 id="promo-title" className="mt-6 text-center text-3xl font-black tracking-tight sm:text-4xl">{t.title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm text-white/65">{info.message || t.subtitle}</p>

          <table className="mt-6 hidden w-full text-sm sm:table">
            <thead>
              <tr className="text-xs uppercase tracking-wider">
                <th className="py-2 text-left font-medium sr-only">Feature</th>
                <th className="w-24 py-2 text-center font-semibold text-white/50">Usually</th>
                <th className="w-32 rounded-t-xl bg-white/[0.06] py-2 text-center font-semibold text-orange-300">{t.label}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, before, now], i) => (
                <tr key={label} className="border-t border-white/10">
                  <td className="py-2.5 font-medium">{label}</td>
                  <td className="py-2.5 text-center text-white/50">{before}</td>
                  <td className={`bg-white/[0.06] py-2.5 text-center font-semibold ${i === rows.length - 1 ? "rounded-b-xl" : ""} ${label === "Coupon code" && info.code ? "font-mono text-orange-200" : ""}`}>{now}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: offer card, perks, countdown, call to action */}
        <div className="flex flex-col border-t border-white/10 bg-black/20 px-6 pb-6 pt-6 sm:px-8 md:border-l md:border-t-0 md:pt-8">
          <h3 className="mb-5 text-center text-lg font-semibold md:pr-8">Your {t.label} deal</h3>

          <div className={`flex items-center gap-4 rounded-2xl border p-4 ${t.ring}`}>
            <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${t.dot}`}>
              <span className="h-2 w-2 rounded-full bg-current" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{info.code ? "Extra savings code" : "Sale prices live"}</div>
              <div className="text-xs text-white/55">{info.code ? "Tap to copy, paste at checkout" : "No code needed, prices are already cut"}</div>
            </div>
            {info.code && (
              <button
                type="button"
                onClick={copy}
                aria-label={`Copy code ${info.code}`}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/40 bg-white/5 px-3 py-2 font-mono text-base font-bold tracking-wider hover:bg-white/10"
              >
                {info.code}
                {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4 opacity-70" />}
                <span className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</span>
              </button>
            )}
          </div>

          <ul className="mt-5 space-y-2.5 text-sm">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          {time && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-2 text-sm text-white/55">Sale ends in</div>
              <div className="grid grid-cols-4 gap-2" role="timer" aria-label={`Sale ends in ${time.d} days ${time.h} hours ${time.m} minutes`}>
                {([["Days", time.d], ["Hrs", time.h], ["Min", time.m], ["Sec", time.s]] as const).map(([l, v]) => (
                  <div key={l} className="rounded-xl border border-white/10 bg-white/5 py-2 text-center">
                    <div className="font-mono text-2xl font-bold tabular-nums">{pad(v)}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-6">
            {season !== "holiday" ? (
              <Link
                href="/shop?onSale=true"
                onClick={close}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${t.button} px-6 py-3.5 text-base font-bold shadow-lg shadow-orange-900/40 transition hover:brightness-110`}
              >
                Shop the sale <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/shop" onClick={close} className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${t.button} px-6 py-3.5 text-base font-bold`}>
                Browse files <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs text-white/50">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Secure checkout with Paystack. Files unlock the moment payment clears.
            </p>

            {pinProfile && (
              <a
                href={pinProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-white/60 hover:text-[#ff4d6d]"
              >
                <PinterestIcon className="h-3.5 w-3.5 text-[#E60023]" /> See the looks on our Pinterest
              </a>
            )}

            <button type="button" onClick={close} className="mt-2 w-full rounded-xl py-2 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
