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
