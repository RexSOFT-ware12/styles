"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { startApiCheckout } from "@/lib/apiBilling";
import { useApiEntitlement } from "@/lib/useApiEntitlement";
import { cn } from "@/lib/utils";
import { Check, Code2, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Marketing copy for the three API tiers. Kept in sync BY HAND with
// style-backend's src/lib/apiTiers.js, which is the actual pricing/quota
// source of truth — this is just what we show before a Checkout session
// (created server-side from that config) exists.
const TIERS = [
  {
    id: "starter" as const,
    label: "API Starter",
    price: "$49",
    period: "/mo",
    blurb: "For a first integration or a low-volume production use.",
    features: ["500 processed images / mo included", "$0.05/image overage (with segmentation)", "$0.02/image overage (background removal only)", "Self-serve — subscribe instantly"],
  },
  {
    id: "growth" as const,
    label: "API Growth",
    price: "$149",
    period: "/mo",
    blurb: "For higher-volume or multi-customer integrations.",
    features: ["2,500 processed images / mo included", "$0.05/image overage (with segmentation)", "$0.02/image overage (background removal only)", "Self-serve — subscribe instantly"],
    highlight: true,
  },
  {
    id: "enterprise" as const,
    label: "API Enterprise",
    price: "Custom",
    period: "",
    blurb: "Negotiated volume, pricing, and terms for larger integrations.",
    features: ["Custom included volume", "Custom overage rate", "Dedicated support"],
  },
];

/**
 * /developers — the shopfront page where a third party discovers and
 * subscribes to programmatic API access to the Garment Tool (as opposed to
 * /pricing, which is the consumer Premium plan for dashboard users). Once
 * subscribed, key generation/management happens at /account/api.
 */
export default function ApiPricingPlans() {
  const { user, token, loading: authLoading } = useAuth();
  const { status, loading: statusLoading } = useApiEntitlement(token);

  const [startingTier, setStartingTier] = useState<"starter" | "growth" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeTier = status?.entitlement.hasAccess ? status.entitlement.tier : null;

  async function handleSubscribe(tier: "starter" | "growth") {
    if (!token) return;
    setError(null);
    setStartingTier(tier);
    try {
      await startApiCheckout(token, tier);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout");
      setStartingTier(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-12 motion-safe:animate-[rise-in_0.5s_ease-out]">
        <Badge variant="secondary" className="mb-4 gap-1.5">
          <Code2 className="h-3.5 w-3.5" /> Built for developers
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
          Add background removal &amp; garment segmentation to your app
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Call the same Garment Tool that powers FabricNow's dashboard from your own product, over a
          simple HTTP API. Pick a tier below, generate a key, and start sending requests.
        </p>
      </div>

      {error && (
        <p className="text-center text-sm text-destructive mb-6" role="alert">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
        {TIERS.map((tier, i) => {
          const isActive = activeTier === tier.id;
          return (
            <div
              key={tier.id}
              className={cn(
                "relative motion-safe:animate-[rise-in_0.5s_ease-out] rounded-2xl border bg-card p-8",
                tier.highlight && "border-2 border-primary shadow-lg"
              )}
              style={{ animationDelay: `${60 + i * 100}ms`, animationFillMode: "backwards" }}
            >
              {tier.highlight && (
                <Badge className="absolute -top-3 left-8 gap-1.5">
                  <Sparkles className="h-3 w-3" /> Most popular
                </Badge>
              )}

              <h2 className="text-lg font-semibold text-foreground mb-1">{tier.label}</h2>
              <p className="text-sm text-muted-foreground mb-5">{tier.blurb}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                <span className="text-muted-foreground text-sm">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={cn("h-4 w-4 mt-0.5 shrink-0", tier.highlight ? "text-primary" : "text-emerald-600")} />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {tier.id === "enterprise" ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact?topic=api-enterprise">Contact us</Link>
                </Button>
              ) : !authLoading && !user ? (
                <Button asChild className="w-full" variant={tier.highlight ? "default" : "outline"}>
                  <Link href={`/signup?redirect=/developers`}>Create an account</Link>
                </Button>
              ) : statusLoading ? (
                <Button className="w-full" variant="outline" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading…
                </Button>
              ) : isActive ? (
                <Button asChild className="w-full" variant="outline">
                  <Link href="/account/api">Manage keys</Link>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={tier.highlight ? "default" : "outline"}
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={startingTier !== null || !!activeTier}
                  title={activeTier ? "You already have an active API subscription — manage it from your account." : undefined}
                >
                  {startingTier === tier.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Subscribe
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {activeTier && (
        <p className="text-center text-sm text-muted-foreground mt-8">
          You're on the {TIERS.find((t) => t.id === activeTier)?.label} plan.{" "}
          <Link href="/account/api" className="underline underline-offset-2">
            View usage &amp; manage your API keys
          </Link>
          .
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground mt-10">
        Overage is billed automatically once your included quota is used for the month — no request is
        ever blocked for going over. Need a bigger commitment?{" "}
        <Link href="/contact?topic=api-enterprise" className="underline underline-offset-2">
          Talk to us about Enterprise
        </Link>
        .
      </p>
    </div>
  );
}
