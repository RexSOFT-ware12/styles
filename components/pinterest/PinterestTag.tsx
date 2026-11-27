"use client";

import { CONSENT_EVENT, getCookieConsent } from "@/lib/cookieConsent";
import { trackPinterest } from "@/lib/pinterest";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Loads the Pinterest Tag (conversion tracking) only after the visitor presses
 * "Accept all" on the cookie banner, and only when a tag id is set in
 * Admin → Pinterest. Sends a page visit on every page change.
 */
export default function PinterestTag({ tagId }: { tagId: string }) {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const check = () => setAllowed(getCookieConsent() === "accepted");
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  useEffect(() => {
    if (!tagId || !allowed || loaded) return;
    if (typeof window.pintrk !== "function") {
      // Pinterest's standard loader: queue calls until core.js arrives.
      const q = function (...args: unknown[]) {
        (q.queue = q.queue || []).push(args);
      } as ((...args: unknown[]) => void) & { queue?: unknown[]; version?: string };
      q.queue = [];
      q.version = "3.0";
      window.pintrk = q;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://s.pinimg.com/ct/core.js";
      document.head.appendChild(s);
    }
    window.pintrk!("load", tagId);
    window.pintrk!("page");
    setLoaded(true);
  }, [tagId, allowed, loaded]);

  useEffect(() => {
    if (loaded) trackPinterest("pagevisit");
  }, [loaded, pathname]);

  return null;
}
