"use client";

import { Button } from "@/components/ui/button";
import { getCookieConsent, setCookieConsent } from "@/lib/cookieConsent";
import { Cookie } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * First-visit cookie banner. FabricNow only uses essential session/cart
 * storage today (see /cookies) — this doesn't gate any site functionality,
 * it just records the person's preference so we have it on hand if/when
 * anything non-essential (e.g. analytics) is ever added.
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  const decide = (value: "accepted" | "declined") => {
    setCookieConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <Cookie className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              We use essential cookies to keep you signed in and remember your
              cart. See our{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>{" "}
              for details.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => decide("declined")}>
              Decline
            </Button>
            <Button size="sm" onClick={() => decide("accepted")}>
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
