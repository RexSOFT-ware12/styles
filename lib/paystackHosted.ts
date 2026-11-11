/** Redirects only to Paystack's HTTPS-hosted checkout domain. */
export function redirectToPaystackCheckout(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Paystack did not return a valid hosted checkout URL.");
  }
  const isPaystackHost = parsed.hostname === "paystack.com" || parsed.hostname.endsWith(".paystack.com");
  if (parsed.protocol !== "https:" || !isPaystackHost) {
    throw new Error("The payment provider returned an invalid checkout URL.");
  }
  window.location.assign(parsed.toString());
}
