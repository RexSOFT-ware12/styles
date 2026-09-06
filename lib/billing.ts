// Freemium gating for the Garment Tool, Pose Tool, and SVG customization:
// 3 free days from signup, then premium ($29.99/mo for new subscribers;
// existing subscribers may be grandfathered at a lower price — see
// EntitlementStatus below). Talks to the main FabricNow backend's
// /api/billing/* routes (src/routes/billing.js).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface EntitlementStatus {
  hasAccess: boolean;
  plan: "free" | "premium";
  subscriptionStatus: string;
  trialActive: boolean;
  trialEndsAt: string;
  trialDaysLeft: number;
  /** Today's list price for a brand-new subscriber, e.g. 29.99. */
  currentPremiumPriceUsd: number;
  /**
   * What THIS account is actually billed, e.g. 19.99 for someone
   * grandfathered in before the price rose. Null if unknown (never
   * subscribed, or subscribed before we started caching it — see
   * style-backend's scripts/backfill-premium-price.js).
   */
  premiumPriceUsd: number | null;
  /** True if premiumPriceUsd is below currentPremiumPriceUsd. */
  isGrandfathered: boolean;
}

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || `Request failed with ${res.status}`;
  } catch {
    return `Request failed with ${res.status}`;
  }
}

export async function fetchEntitlement(token: string): Promise<EntitlementStatus> {
  const res = await fetch(`${API_BASE}/billing/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Kicks off Stripe Checkout for the premium plan and redirects there. */
export async function startPremiumCheckout(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/billing/checkout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const { url } = await res.json();
  window.location.href = url;
}

/** Opens Stripe's hosted Billing Portal so a subscriber can update or cancel. */
export async function openBillingPortal(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/billing/portal`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const { url } = await res.json();
  window.location.href = url;
}
