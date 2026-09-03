const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: "pending" | "paid";
  total: number;
  items: OrderItem[];
  createdAt: string;
  paidAt: string | null;
}

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || `Request failed with ${res.status}`;
  } catch {
    return `Request failed with ${res.status}`;
  }
}

/** Kicks off a Stripe Checkout Session for the given cart items and returns the redirect URL. */
export async function createCheckoutSession(
  token: string,
  items: { productId: string | number; quantity: number }[]
): Promise<{ url: string; orderId: string }> {
  const res = await fetch(`${API_BASE}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** The signed-in user's full purchase history — powers the "My Purchases" page. */
export async function getMyOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const json = await res.json();
  return json.data;
}

/**
 * Downloads a purchased product's digital bundle. The endpoint is
 * auth+ownership gated, so we fetch it as a blob (with the bearer token)
 * rather than linking to it directly, then trigger a normal browser save.
 */
export async function downloadPurchase(
  token: string,
  orderId: string,
  productId: string | number,
  suggestedName?: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/download/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName || "download.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
