"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Remembers a friend's referral code (?ref=CODE) until the visitor signs up. */
export default function ReferralCapture() {
  const params = useSearchParams();
  const ref = params.get("ref");
  useEffect(() => {
    if (ref && /^[A-Za-z0-9]{4,20}$/.test(ref)) {
      try {
        localStorage.setItem("fabricnow_ref", ref.toUpperCase());
      } catch {}
    }
  }, [ref]);
  return null;
}
