const STORAGE_KEY = "fabricnow_cookie_consent";

export type CookieConsent = "accepted" | "declined";

interface StoredConsent {
  value: CookieConsent;
  decidedAt: string;
  /** Bumped when what "Accept all" covers changes, so everyone is asked again. */
  version?: number;
}

// v2: "Accept all" now also covers the Pinterest Tag and Pinterest board embeds.
const CONSENT_VERSION = 2;

/**
 * Reads the person's cookie-banner choice, if they've made one. Returns
 * null if they haven't decided yet (or we're server-side / storage is
 * unavailable) — callers should treat that as "show the banner".
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredConsent = JSON.parse(raw);
    if ((parsed.version ?? 1) < CONSENT_VERSION) return null;
    return parsed.value === "accepted" || parsed.value === "declined" ? parsed.value : null;
  } catch {
    return null;
  }
}

/** Fired on window whenever the visitor makes or changes their choice. */
export const CONSENT_EVENT = "fabricnow:cookie-consent";

export function setCookieConsent(value: CookieConsent) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, decidedAt: new Date().toISOString(), version: CONSENT_VERSION }));
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — nothing to do;
    // the banner will just reappear next visit, which is an acceptable
    // fallback rather than breaking anything.
  }
}
