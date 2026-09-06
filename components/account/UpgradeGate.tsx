"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { startPremiumCheckout } from "@/lib/billing";
import { Loader2, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * Shown in place of a gated tool (Garment Tool, Pose Tool, SVG
 * customization) once the 3-day free trial has ended and the account isn't
 * premium. `featureName` is used only for copy — the actual entitlement
 * check happens server-side on every request either way.
 */
export function UpgradeGate({ featureName }: { featureName: string }) {
  const { token } = useAuth();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!token) return;
    setError(null);
    setStarting(true);
    try {
      await startPremiumCheckout(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout");
      setStarting(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center text-center gap-4 py-12">
        <div className="rounded-full bg-muted p-3">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Your free trial has ended</h2>
          <p className="text-muted-foreground max-w-sm">
            {featureName} is a premium feature. Upgrade to keep using it, plus the Garment Tool, Pose
            Tool, and SVG customization.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Premium — $19.99/mo
        </Badge>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleUpgrade} disabled={starting}>
            {starting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Upgrade to Premium
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account">Back to account</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Small inline banner shown above a gated tool while the trial is still active. */
export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
      <span>
        {daysLeft === 0
          ? "Your free trial ends today."
          : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your free trial.`}
      </span>
      <Link href="/account" className="font-medium underline underline-offset-2 whitespace-nowrap ml-4">
        Upgrade anytime
      </Link>
    </div>
  );
}
