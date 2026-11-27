import { SITE_URL } from "@/lib/site";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface PinterestBoard {
  title: string;
  url: string;
  /** Optional style name ("Streetwear") used to show matching products under the board. */
  style?: string;
}

/** Set from Admin → Pinterest in the dashboard. Every field may be empty. */
export interface PinterestSettings {
  profileUrl: string;
  boards: PinterestBoard[];
  tagId: string;
  domainVerify: string;
  /** Only filled while the coupon is live. */
  welcomeCode: string;
  welcomeMessage: string;
}

export const EMPTY_PINTEREST: PinterestSettings = {
  profileUrl: "",
  boards: [],
  tagId: "",
  domainVerify: "",
  welcomeCode: "",
  welcomeMessage: "",
};

/**
 * Vercel environment variables win over the dashboard values, so the tag and
 * the verification code can also be set without the backend.
 */
function withEnv(s: PinterestSettings): PinterestSettings {
  return {
    ...s,
    profileUrl: process.env.NEXT_PUBLIC_PINTEREST_PROFILE_URL || s.profileUrl,
    tagId: process.env.NEXT_PUBLIC_PINTEREST_TAG_ID || s.tagId,
    domainVerify: process.env.NEXT_PUBLIC_PINTEREST_DOMAIN_VERIFY || s.domainVerify,
  };
}

function normalise(json: Partial<PinterestSettings> | null | undefined): PinterestSettings {
  return withEnv({
    ...EMPTY_PINTEREST,
    ...(json || {}),
    boards: Array.isArray(json?.boards) ? json!.boards : [],
  });
}

/** Server-side read, cached for a minute. Never throws. */
export async function getPinterestSettings(): Promise<PinterestSettings> {
  try {
    const res = await fetch(`${API_BASE}/pinterest`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(String(res.status));
    return normalise(await res.json());
  } catch {
    return normalise(null);
  }
}

let clientPromise: Promise<PinterestSettings> | null = null;
/** Browser-side read, shared by every component on the page. Never throws. */
export function loadPinterestSettings(): Promise<PinterestSettings> {
  if (!clientPromise) {
    clientPromise = fetch(`${API_BASE}/pinterest`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then(normalise);
  }
  return clientPromise;
}

/** Makes a relative or protocol-less image/page address absolute, which Pinterest requires. */
export function absoluteUrl(src: string | undefined | null): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("//")) return `https:${src}`;
  return `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Pinterest can't pin SVGs, so fall back to another image when the chosen one is an SVG. */
export function pinnableImage(...candidates: (string | undefined | null)[]): string {
  const ok = candidates.find((c) => c && !/\.svg(\?|#|$)/i.test(c));
  return absoluteUrl(ok || candidates.find(Boolean) || "");
}

export function productPinDescription(p: { name: string; style?: string; fabric?: string; category?: string }): string {
  const bits = [p.style, p.fabric].filter(Boolean).join(" · ");
  return `${p.name}${bits ? ` (${bits})` : ""} – ready-to-use CLO3D .zprj garment file | FabricNow`.slice(0, 500);
}

/** Opens Pinterest's "Save" dialog for a page + image. */
export function pinCreateUrl({ url, media, description }: { url: string; media: string; description: string }): string {
  const q = new URLSearchParams({ url: absoluteUrl(url), media: absoluteUrl(media), description: description.slice(0, 500) });
  return `https://www.pinterest.com/pin/create/button/?${q.toString()}`;
}

export function openPinDialog(args: { url: string; media: string; description: string }) {
  const w = 750;
  const h = 650;
  const left = Math.max(0, (window.screen.width - w) / 2);
  const top = Math.max(0, (window.screen.height - h) / 2);
  // "noopener" in the feature string would make window.open return null, so the opener is cut by hand.
  const win = window.open(pinCreateUrl(args), "pin", `width=${w},height=${h},left=${left},top=${top}`);
  if (win) {
    try { win.opener = null; } catch { /* ignore */ }
  } else {
    // Popup blocked (common on phones): go to Pinterest in this tab.
    window.location.href = pinCreateUrl(args);
  }
}

// ---- Pinterest Tag (conversion tracking) -----------------------------------
type PinEvent = "pagevisit" | "addtocart" | "checkout" | "signup" | "lead" | "search" | "viewcategory";

declare global {
  interface Window {
    pintrk?: ((...args: unknown[]) => void) & { queue?: unknown[]; version?: string };
  }
}

/** Sends a Pinterest Tag event if the tag is loaded (i.e. the visitor accepted cookies). Safe to call anywhere. */
export function trackPinterest(event: PinEvent, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.pintrk !== "function") return;
  try {
    window.pintrk("track", event, data);
  } catch {
    // Tracking must never break the page.
  }
}

// ---- Visitors who arrive from Pinterest -------------------------------------
const FROM_PIN_KEY = "fabricnow_from_pinterest";

/** True when this visit started from a pin (utm_source=pinterest or a Pinterest referrer). Remembered for the session. */
export function cameFromPinterest(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(FROM_PIN_KEY) === "1") return true;
    const params = new URLSearchParams(window.location.search);
    const utm = (params.get("utm_source") || "").toLowerCase();
    const ref = document.referrer.toLowerCase();
    const yes = utm.includes("pinterest") || /(^https?:\/\/)?([a-z0-9-]+\.)*(pinterest\.[a-z.]+|pin\.it)\//.test(ref);
    if (yes) sessionStorage.setItem(FROM_PIN_KEY, "1");
    return yes;
  } catch {
    return false;
  }
}
