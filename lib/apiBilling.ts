// Client for the API-access tiers (developer/programmatic access via an
// API key, separate product from the consumer Premium plan — see
// lib/billing.ts for that one). Talks to the main FabricNow backend's
// /api/billing/api-* routes (src/routes/billing.js), which are the same
// routes garment-service's requireApiAccess middleware checks against.
//
// Pricing/quota shown on /developers is marketing copy kept in sync BY HAND
// with style-backend's src/lib/apiTiers.js — that file is the actual source
// of truth for what gets charged; nothing here reads it directly since it
// lives in a different deployable.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type ApiTier = "starter" | "growth" | "enterprise";

export interface ApiKeySummary {
  id: string;
  label: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface ApiEntitlement {
  hasAccess: boolean;
  tier: ApiTier | null;
  status: string;
  quota: number | null;
  used: number;
  remaining: number | null;
  currentPeriodEnd: string | null;
}

export interface ApiStatus {
  entitlement: ApiEntitlement;
  keys: ApiKeySummary[];
}

/** The plaintext key is only ever present right after creation — see createApiKey. */
export interface CreatedApiKey extends ApiKeySummary {
  key: string;
}

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || `Request failed with ${res.status}`;
  } catch {
    return `Request failed with ${res.status}`;
  }
}

export async function fetchApiStatus(token: string): Promise<ApiStatus> {
  const res = await fetch(`${API_BASE}/billing/api-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Kicks off Stripe Checkout for the given self-serve tier ("starter" | "growth") and redirects there. */
export async function startApiCheckout(token: string, tier: "starter" | "growth"): Promise<void> {
  const res = await fetch(`${API_BASE}/billing/api-checkout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const { url } = await res.json();
  window.location.href = url;
}

/** Generates a new API key. Requires an active API subscription — see startApiCheckout. */
export async function createApiKey(token: string, label?: string): Promise<CreatedApiKey> {
  const res = await fetch(`${API_BASE}/billing/api-keys`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(label ? { label } : {}),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Revokes a key immediately. Doesn't affect the subscription or other keys. */
export async function revokeApiKey(token: string, keyId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/billing/api-keys/${keyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
}
