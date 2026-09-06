"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { changePassword, updateProfile } from "@/lib/auth";
import { openBillingPortal, startPremiumCheckout } from "@/lib/billing";
import { useEntitlement } from "@/lib/useEntitlement";
import { CheckCircle2, Download, KeyRound, Loader2, Scissors, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PlanStatusCard() {
  const { token } = useAuth();
  const { entitlement, loading } = useEntitlement(token);
  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("upgraded") === "1";

  const [starting, setStarting] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
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

  const handleManageBilling = async () => {
    if (!token) return;
    setError(null);
    setOpeningPortal(true);
    try {
      await openBillingPortal(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open billing portal");
      setOpeningPortal(false);
    }
  };

  if (loading || !entitlement) {
    return (
      <Card>
        <CardContent className="py-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isPremium = entitlement.plan === "premium" && entitlement.hasAccess;

  return (
    <Card className={justUpgraded ? "border-emerald-300 motion-safe:animate-[pop-in_0.4s_ease-out]" : undefined}>
      <CardContent className="pt-6">
        {justUpgraded && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 mb-4 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            You&apos;re on Premium — the Garment Tool, Pose Tool, and SVG customization are all unlocked.
          </div>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">Plan</p>
              <Badge variant={isPremium ? "default" : "secondary"} className="gap-1">
                {isPremium && <Sparkles className="h-3 w-3" />}
                {isPremium ? "Premium" : "Free"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPremium
                ? "$19.99/mo — the Garment Tool, Pose Tool, and SVG customization are all unlocked."
                : entitlement.trialActive
                ? `${entitlement.trialDaysLeft} day${entitlement.trialDaysLeft === 1 ? "" : "s"} left in your free trial.`
                : "Your free trial has ended."}
            </p>
          </div>

          {isPremium ? (
            <Button size="sm" variant="outline" onClick={handleManageBilling} disabled={openingPortal}>
              {openingPortal && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Manage billing
            </Button>
          ) : (
            <Button size="sm" onClick={handleUpgrade} disabled={starting}>
              {starting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1.5" />
              )}
              Upgrade to Premium
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-destructive mt-3">{error}</p>}

        {!isPremium && (
          <Link href="/pricing" className="text-xs text-muted-foreground underline underline-offset-2 mt-3 inline-block">
            Compare Free vs Premium
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function AccountOverviewPage() {
  const { user, token, loading: authLoading, refreshUser, logout } = useAuth();

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to view your account</h1>
        <Button asChild className="mt-4">
          <Link href="/signin?redirect=/account">Sign in</Link>
        </Button>
      </div>
    );
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setNameMessage(null);
    setSavingName(true);
    try {
      await updateProfile(token, { name: name.trim() });
      await refreshUser();
      setNameMessage({ type: "success", text: "Name updated." });
    } catch (err) {
      setNameMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't update name" });
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPasswordMessage(null);
    setChangingPassword(true);
    try {
      await changePassword(token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage({ type: "success", text: "Password changed." });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Couldn't change password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Account</h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>

      <Suspense fallback={null}>
        <PlanStatusCard />
      </Suspense>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/account/purchases">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">My Purchases</p>
                <p className="text-sm text-muted-foreground">Downloads &amp; order history</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/garment-tool">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-3">
              <Scissors className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Garment Tool</p>
                <p className="text-sm text-muted-foreground">Process a design .psd</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" /> Profile details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="name">
                Name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="email">
                Email
              </label>
              <Input id="email" value={user?.email ?? ""} disabled />
              <p className="text-xs text-muted-foreground mt-1">Contact support to change your email.</p>
            </div>
            {nameMessage && (
              <p className={`text-sm ${nameMessage.type === "error" ? "text-destructive" : "text-emerald-600"}`}>
                {nameMessage.text}
              </p>
            )}
            <Button type="submit" disabled={savingName}>
              {savingName ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5" /> Change password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="currentPassword">
                Current password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="newPassword">
                New password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.type === "error" ? "text-destructive" : "text-emerald-600"}`}>
                {passwordMessage.text}
              </p>
            )}
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
