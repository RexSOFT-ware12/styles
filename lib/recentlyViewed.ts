export interface RecentItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
}

const KEY = "fabricnow_recently_viewed_v1";
const MAX = 12;

export function readRecent(): RecentItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function trackRecent(item: RecentItem) {
  try {
    const next = [item, ...readRecent().filter((p) => String(p.id) !== String(item.id))].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode) — recently viewed just won't persist */
  }
}
