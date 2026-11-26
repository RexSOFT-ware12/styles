"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getQuote, type Quote } from "@/lib/store";
import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "fabricnow_coupon";

/** Server-priced cart: volume discount + coupon. The coupon code survives cart → checkout. */
export function useCartQuote() {
  const { cart } = useCart();
  const { token } = useAuth();
  const [code, setCode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      setCode(sessionStorage.getItem(KEY) || "");
    } catch {}
  }, []);

  const idsKey = useMemo(() => cart.map((c) => c.id).join(","), [cart]);

  useEffect(() => {
    if (cart.length === 0) {
      setQuote(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setFailed(false);
    getQuote(cart.map((c) => ({ productId: c.id })), code, token)
      .then((q) => {
        if (!alive) return;
        setQuote(q);
        // Drop a code that the server rejected so it isn't silently re-sent.
        if (code && q.couponError === null && !q.couponCode) setCode("");
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, code, token]);

  const applyCode = useCallback((value: string) => {
    const next = value.trim().toUpperCase();
    setCode(next);
    try {
      if (next) sessionStorage.setItem(KEY, next);
      else sessionStorage.removeItem(KEY);
    } catch {}
  }, []);

  // Fallback if the pricing service is unreachable: plain subtotal, no discounts.
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  return { quote, loading, failed, code, applyCode, subtotal, appliedCode: quote?.couponCode ?? null };
}
