const STORAGE_KEY = "fabricnow_cookie_consent";

export type CookieConsent = "accepted" | "declined";

interface StoredConsent {
  value: CookieConsent;
  decidedAt: string;
}

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
    return parsed.value === "accepted" || parsed.value === "declined" ? parsed.value : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(value: CookieConsent) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, decidedAt: new Date().toISOString() }));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — nothing to do;
    // the banner will just reappear next visit, which is an acceptable
    // fallback rather than breaking anything.
  }
}
