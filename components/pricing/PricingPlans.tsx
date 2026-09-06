"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { openBillingPortal, startPremiumCheckout } from "@/lib/billing";
import { useEntitlement } from "@/lib/useEntitlement";
import { cn } from "@/lib/utils";
import {
  Check,
  Loader2,
  PersonStanding,
  Scissors,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FeatureRow = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  free: string | boolean;
  premium: string | boolean;
};

const FEATURES: FeatureRow[] = [
  { label: "Browse & buy design patterns", icon: Sparkles, free: true, premium: true },
  { label: "Live PNG → SVG demo trace", icon: Wand2, free: true, premium: true },
  { label: "Garment Tool (background removal + part traces)", icon: Scissors, free: "3-day trial", premium: true },
  { label: "Pose Tool (CLO3D pose notes + turnaround refs)", icon: PersonStanding, free: "3-day trial", premium: true },
  { label: "SVG customization (steps, color, background)", icon: Sparkles, free: "3-day trial", premium: true },
];

// Fallback for logged-out visitors / before the entitlement fetch resolves —
// kept in sync with style-backend's lib/premiumPricing.js CURRENT_PRICE_CENTS.
// Once `entitlement` loads, entitlement.currentPremiumPriceUsd (the backend's
// source of truth) takes over.
const FALLBACK_PREMIUM_PRICE_USD = 29.99;

/**
 * The Free vs Premium comparison at /pricing — the one place on the site
 * that actually explains what the Premium plan buys you. Linked from the
 * header nav, the sitewide trial banner, and every gated tool's paywall.
 */
export default function PricingPlans() {
  const { user, token, loading: authLoading } = useAuth();
  const { entitlement, loading: entitlementLoading } = useEntitlement(token);

  const [starting, setStarting] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = !!entitlement && entitlement.plan === "premium" && entitlement.hasAccess;
  const isFreeTrial = !!entitlement && entitlement.plan === "free" && entitlement.trialActive;
  const isExpired = !!entitlement && !entitlement.hasAccess;

  // For an active subscriber, show what THEY actually pay (which may be a
  // grandfathered rate); otherwise show today's list price for new signups.
  const displayedPremiumPrice =
    isPremium && entitlement?.premiumPriceUsd != null
      ? entitlement.premiumPriceUsd
      : entitlement?.currentPremiumPriceUsd ?? FALLBACK_PREMIUM_PRICE_USD;
  const showGrandfatheredNote = isPremium && !!entitlement?.isGrandfathered;

  async function handleUpgrade() {
    if (!token) return;
    setError(null);
    setStarting(true);
    try {
      await startPremiumCheckout(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout");
      setStarting(false);
    }
  }

  async function handleManageBilling() {
    if (!token) return;
    setError(null);
    setOpeningPortal(true);
    try {
      await openBillingPortal(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open billing portal");
      setOpeningPortal(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-12 motion-safe:animate-[rise-in_0.5s_ease-out]">
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Simple pricing
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
          Every account gets a 3-day free trial
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Try the Garment Tool, Pose Tool, and SVG customization free for 3 days from signup. Keep
          using them for ${(entitlement?.currentPremiumPriceUsd ?? FALLBACK_PREMIUM_PRICE_USD).toFixed(2)}/mo —
          cancel anytime.
        </p>
      </div>

      {error && (
        <p className="text-center text-sm text-destructive mb-6" role="alert">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Free plan */}
        <div
          className="motion-safe:animate-[rise-in_0.5s_ease-out] rounded-2xl border bg-card p-8"
          style={{ animationDelay: "60ms", animationFillMode: "backwards" }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-1">Free</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Everything you need to try FabricNow's tools.
          </p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">$0</span>
            <span className="text-muted-foreground text-sm"> / 3-day trial</span>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES.map(({ label, free }) => (
              <FeatureItem key={label} value={free} label={label} />
            ))}
          </ul>

          {!authLoading && !user ? (
            <Button asChild variant="outline" className="w-full">
              <Link href="/signup?redirect=/pricing">Create a free account</Link>
            </Button>
          ) : isFreeTrial ? (
            <Button variant="outline" className="w-full" disabled>
              Current plan — {entitlement?.trialDaysLeft} day{entitlement?.trialDaysLeft === 1 ? "" : "s"} left
            </Button>
          ) : isExpired ? (
            <Button variant="outline" className="w-full" disabled>
              Trial ended
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Included with every account
            </Button>
          )}
        </div>

        {/* Premium plan */}
        <div
          className="relative motion-safe:animate-[rise-in_0.5s_ease-out] rounded-2xl border-2 border-primary bg-card p-8 shadow-lg"
          style={{ animationDelay: "160ms", animationFillMode: "backwards" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px -z-10 rounded-2xl motion-safe:animate-[price-glow_4s_ease-in-out_infinite] blur-xl"
            style={{ background: "radial-gradient(closest-side, color-mix(in oklch, var(--primary) 30%, transparent), transparent)" }}
          />

          <Badge className="absolute -top-3 left-8 gap-1.5">
            <Sparkles className="h-3 w-3" /> Recommended
          </Badge>

          <h2 className="text-lg font-semibold text-foreground mb-1">Premium</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Unlimited access to every gated tool, for as long as you need it.
          </p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">${displayedPremiumPrice.toFixed(2)}</span>
            <span className="text-muted-foreground text-sm"> / month</span>
          </div>

          {showGrandfatheredNote && (
            <p className="text-xs text-muted-foreground -mt-4 mb-6">
              You're on a legacy rate from before our price change — it stays this way as long as you
              keep your subscription active.
            </p>
          )}

          <ul className="space-y-3 mb-8">
            {FEATURES.map(({ label, premium }) => (
              <FeatureItem key={label} value={premium} label={label} highlight />
            ))}
          </ul>

          <div
            className="rounded-lg overflow-hidden"
            style={
              !isPremium
                ? {
                    backgroundImage:
                      "linear-gradient(100deg, transparent 30%, color-mix(in oklch, var(--primary-foreground) 25%, transparent) 45%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }
                : undefined
            }
          >
            {!authLoading && !user ? (
              <Button asChild className="w-full">
                <Link href="/signup?redirect=/pricing">Start free trial</Link>
              </Button>
            ) : entitlementLoading ? (
              <Button className="w-full" disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…
              </Button>
            ) : isPremium ? (
              <Button variant="outline" className="w-full" onClick={handleManageBilling} disabled={openingPortal}>
                {openingPortal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Manage billing
              </Button>
            ) : (
              <Button
                className="w-full motion-safe:hover:animate-[shimmer-sweep_1.6s_ease-in-out_infinite]"
                onClick={handleUpgrade}
                disabled={starting}
              >
                {starting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isFreeTrial ? "Upgrade now" : "Upgrade to Premium"}
              </Button>
            )}
          </div>

          {isPremium && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Manage billing to update your card or cancel anytime.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | boolean;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      {value === false ? (
        <X className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
      ) : (
        <Check className={cn("h-4 w-4 mt-0.5 shrink-0", highlight ? "text-primary" : "text-emerald-600")} />
      )}
      <span className={value === false ? "text-muted-foreground/60" : "text-foreground"}>
        {label}
        {typeof value === "string" && <span className="text-muted-foreground"> — {value}</span>}
      </span>
    </li>
  );
}
