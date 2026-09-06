"use client";

import { useAuth } from "@/context/AuthContext";
import { useEntitlement } from "@/lib/useEntitlement";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISS_KEY = "fabricnow_trial_banner_dismissed_until";

/**
 * Sitewide strip (shown on every page, not just the gated tool pages)
 * telling a signed-in free-plan user how much trial time is left, or that
 * it's ended — with a direct link to /pricing either way. Without this,
 * the only place someone found out their trial existed was by opening a
 * gated tool directly.
 */
export default function PremiumTrialBanner() {
  const { user, token, loading: authLoading } = useAuth();
  const { entitlement, loading: entitlementLoading } = useEntitlement(token);
  const [dismissed, setDismissed] = useState(true); // default hidden until we know it's safe to show

  useEffect(() => {
    if (typeof window === "undefined") return;
    const until = Number(sessionStorage.getItem(DISMISS_KEY) || 0);
    setDismissed(Date.now() < until);
  }, []);

  if (authLoading || entitlementLoading || !user || !entitlement || dismissed) return null;
  // Only nag free-plan users — premium subscribers see nothing here.
  if (entitlement.plan === "premium") return null;
  // Still plenty of trial left — no need to interrupt every page yet.
  if (entitlement.trialActive && entitlement.trialDaysLeft > 1) return null;

  const expired = !entitlement.hasAccess;

  function dismiss() {
    if (typeof window !== "undefined") {
      // Re-appears next browser session rather than being gone forever —
      // an expired trial is worth resurfacing.
      sessionStorage.setItem(DISMISS_KEY, String(Date.now() + 1000 * 60 * 60 * 4));
    }
    setDismissed(true);
  }

  return (
    <div
      className={
        expired
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
      }
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3 text-sm">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="text-center">
          {expired
            ? "Your free trial has ended — upgrade to keep using the Garment Tool, Pose Tool, and SVG customization."
            : `Your free trial ends ${entitlement.trialDaysLeft === 0 ? "today" : "tomorrow"} — upgrade to keep full access.`}
        </span>
        <Link href="/pricing" className="font-semibold underline underline-offset-2 whitespace-nowrap">
          See plans
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-1 rounded p-0.5 hover:bg-white/20 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
