let scriptPromise: Promise<void> | null = null;

declare global {
  interface Window { PaystackPop?: new () => { resumeTransaction: (accessCode: string) => void } }
}

async function loadPaystackInline(): Promise<void> {
  if (typeof window === "undefined") throw new Error("Checkout is only available in a browser.");
  if (window.PaystackPop) return;
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-fabricnow-paystack="true"]');
      const script = existing || document.createElement("script");
      script.src = "https://js.paystack.co/v2/inline.js";
      script.async = true;
      script.dataset.fabricnowPaystack = "true";
      script.onload = () => resolve();
      script.onerror = () => { scriptPromise = null; reject(new Error("Could not load secure Paystack checkout. Please try again.")); };
      if (!existing) document.head.appendChild(script);
    });
  }
  await scriptPromise;
  if (!window.PaystackPop) throw new Error("Paystack checkout did not initialize. Please refresh and try again.");
}

export async function openPaystackInline(accessCode: string): Promise<void> {
  if (!accessCode) throw new Error("The server did not return a Paystack checkout code.");
  await loadPaystackInline();
  const Popup = window.PaystackPop;
  if (!Popup) throw new Error("Paystack checkout is unavailable.");
  new Popup().resumeTransaction(accessCode);
}
