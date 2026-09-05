const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
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
  items: { productId: string | number }[]
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
  setCachedOrders(token, json.data);
  return json.data;
}

// In-memory cache for the current session, keyed by token. The purchases
// page used to reset to a blank "Loading your orders..." state on every
// visit, even seconds after the same list had already loaded once. Reading
// from this cache first lets a repeat visit render instantly, while the
// page still revalidates against the network in the background.
let ordersCache: { token: string; orders: Order[] } | null = null;

export function getCachedOrders(token: string): Order[] | null {
  return ordersCache && ordersCache.token === token ? ordersCache.orders : null;
}

export function setCachedOrders(token: string, orders: Order[]): void {
  ordersCache = { token, orders };
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

  const filename = suggestedName || "download.zip";

  // Prefer the File System Access API on Chromium-based browsers so a 500MB
  // or 1GB ZIP is streamed straight to disk instead of first being copied
  // into one enormous Blob in RAM. The server endpoint itself also streams
  // directly from private GCS and has no expiring download URL.
  if (res.body && "showSaveFilePicker" in window) {
    const picker = (window as Window & {
      showSaveFilePicker?: (options?: {
        suggestedName?: string;
        types?: Array<{ description?: string; accept: Record<string, string[]> }>;
      }) => Promise<{ createWritable: () => Promise<WritableStreamDefaultWriter & { close: () => Promise<void> }> }>;
    }).showSaveFilePicker;

    if (picker) {
      const handle = await picker({
        suggestedName: filename,
        types: [{ description: "ZIP archive", accept: { "application/zip": [".zip"] } }],
      });
      const writable = await handle.createWritable();
      const reader = res.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writable.write(value);
        }
      } finally {
        await writable.close();
      }
      return;
    }
  }

  // Compatibility fallback for browsers without File System Access support.
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
