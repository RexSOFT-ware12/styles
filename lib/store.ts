const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function post<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json as T;
}

export interface Quote {
  subtotal: number;
  itemCount: number;
  volumePercent: number;
  volumeDiscount: number;
  couponCode: string | null;
  couponDiscount: number;
  couponError: string | null;
  total: number;
  tiers: { minItems: number; percent: number }[];
  nextTier: { itemsNeeded: number; percent: number; minItems: number } | null;
}

export function getQuote(items: { productId: string | number }[], couponCode?: string, token?: string | null) {
  return post<Quote>("/pricing/quote", { items, couponCode: couponCode || undefined }, token);
}

export function subscribeEmail(email: string, opts: { watchProductIds?: (string | number)[]; source?: string } = {}) {
  return post<{ ok: boolean; welcomeSent: boolean }>("/subscribers", {
    email,
    source: opts.source,
    watchProductIds: opts.watchProductIds?.map(String),
  });
}

export function sendFabricRequest(data: { name: string; email: string; fabricType?: string; description: string; referenceUrl?: string }, token?: string | null) {
  return post<{ ok: boolean }>("/fabric-requests", data, token);
}

export function sendTestimonial(data: { name: string; email: string; role?: string; rating: number; quote: string }, token?: string | null) {
  return post<{ ok: boolean; message: string }>("/testimonials", data, token);
}

export interface Testimonial {
  id: string;
  createdAt?: string;
  name: string;
  role?: string;
  rating: number;
  quote: string;
  verifiedBuyer?: boolean;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${API_BASE}/testimonials`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

export interface ReviewSummary {
  count: number;
  average: number | null;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const EMPTY_SUMMARY: ReviewSummary = { count: 0, average: null, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

/** Overall store rating from approved reviews only. */
export async function getReviewSummary(): Promise<ReviewSummary> {
  try {
    const res = await fetch(`${API_BASE}/testimonials/summary`, { next: { revalidate: 300 } });
    if (!res.ok) return EMPTY_SUMMARY;
    return (await res.json()) as ReviewSummary;
  } catch {
    return EMPTY_SUMMARY;
  }
}

export async function getReviewsPage(page: number, limit = 20): Promise<{ data: Testimonial[]; total: number; hasMore: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/testimonials?page=${page}&limit=${limit}`, { next: { revalidate: 300 } });
    if (!res.ok) return { data: [], total: 0, hasMore: false };
    return await res.json();
  } catch {
    return { data: [], total: 0, hasMore: false };
  }
}

export interface ReferralInfo {
  code: string;
  link: string;
  friendsJoined: number;
  friendsPurchased: number;
  rewards: { code: string; used: boolean; expiresAt: string | null }[];
}

export async function getReferral(token: string): Promise<ReferralInfo> {
  const res = await fetch(`${API_BASE}/referrals/me`, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Couldn't load your referral link");
  return json;
}

export async function getBestsellers(limit = 8) {
  try {
    const res = await fetch(`${API_BASE}/products/bestsellers?limit=${limit}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}
