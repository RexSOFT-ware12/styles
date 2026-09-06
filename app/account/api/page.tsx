"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { openBillingPortal } from "@/lib/billing";
import { ApiKeySummary, createApiKey, revokeApiKey } from "@/lib/apiBilling";
import { useApiEntitlement } from "@/lib/useApiEntitlement";
import { Check, Copy, KeyRound, Loader2, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TIER_LABELS: Record<string, string> = {
  starter: "API Starter",
  growth: "API Growth",
  enterprise: "API Enterprise",
};

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** Shows a freshly-created key's plaintext exactly once, with a copy button. */
function NewKeyReveal({ plaintextKey, onDismiss }: { plaintextKey: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(plaintextKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permissions can fail silently in some browsers/contexts —
      // the key is still selectable text in the box below, so this isn't
      // the only way to grab it.
    }
  }

  return (
    <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 mb-6">
      <p className="text-sm font-medium text-foreground mb-1">Your new API key</p>
      <p className="text-xs text-muted-foreground mb-3">
        Copy this now — for security, we only show it once and can't display it again later.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-md bg-background border px-3 py-2 text-sm font-mono break-all select-all">
          {plaintextKey}
        </code>
        <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <Button size="sm" variant="ghost" className="mt-3" onClick={onDismiss}>
        Done, I've saved it
      </Button>
    </div>
  );
}

function ApiKeyRow({ apiKey, onRevoke }: { apiKey: ApiKeySummary; onRevoke: (id: string) => void }) {
  const [revoking, setRevoking] = useState(false);
  const isRevoked = !!apiKey.revokedAt;

  async function handleRevoke() {
    if (!confirm(`Revoke "${apiKey.label}"? Any requests using this key will stop working immediately.`)) return;
    setRevoking(true);
    try {
      await onRevoke(apiKey.id);
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{apiKey.label}</p>
          {isRevoked && (
            <Badge variant="secondary" className="text-xs">
              Revoked
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono">{apiKey.keyPrefix}…</p>
        <p className="text-xs text-muted-foreground">
          Created {formatDate(apiKey.createdAt)} · Last used {formatDate(apiKey.lastUsedAt)}
        </p>
      </div>
      {!isRevoked && (
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0" onClick={handleRevoke} disabled={revoking}>
          {revoking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

export default function AccountApiPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { status, loading, error: loadError, reload } = useApiEntitlement(token);

  const [openingPortal, setOpeningPortal] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to view your API access</h1>
        <Button asChild className="mt-4">
          <Link href="/signin?redirect=/account/api">Sign in</Link>
        </Button>
      </div>
    );
  }

  async function handleManageBilling() {
    if (!token) return;
    setOpeningPortal(true);
    try {
      await openBillingPortal(token);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't open billing portal");
      setOpeningPortal(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreateError(null);
    setCreating(true);
    try {
      const created = await createApiKey(token, newKeyLabel.trim() || undefined);
      setJustCreatedKey(created.key);
      setNewKeyLabel("");
      await reload();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Couldn't generate a key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!token) return;
    try {
      await revokeApiKey(token, keyId);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't revoke that key");
    }
  }

  const entitlement = status?.entitlement;
  const hasSubscription = !!entitlement && entitlement.tier !== null;
  const isActive = !!entitlement?.hasAccess;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">API Access</h1>
        <p className="text-muted-foreground">
          Manage your programmatic API subscription and keys — separate from your Premium dashboard plan.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-6 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : loadError ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{loadError}</CardContent>
        </Card>
      ) : !hasSubscription ? (
        <Card>
          <CardContent className="pt-6 text-center py-10">
            <KeyRound className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No API subscription yet</p>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              Subscribe to an API tier to generate a key and start calling the Garment Tool from your
              own app.
            </p>
            <Button asChild>
              <Link href="/developers">
                <Sparkles className="h-4 w-4 mr-1.5" /> View API plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">Plan</p>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {entitlement?.tier ? TIER_LABELS[entitlement.tier] : "—"}
                    </Badge>
                    {!isActive && (
                      <Badge variant="destructive" className="text-xs">
                        {entitlement?.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entitlement?.quota == null
                      ? "Custom volume."
                      : `${entitlement.used.toLocaleString()} / ${entitlement.quota.toLocaleString()} images used this period.`}
                    {entitlement?.remaining != null && entitlement.remaining <= 0 && (
                      <span> Extra usage is billed automatically as overage.</span>
                    )}
                  </p>
                  {entitlement?.currentPeriodEnd && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current period ends {formatDate(entitlement.currentPeriodEnd)}.
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={handleManageBilling} disabled={openingPortal}>
                  {openingPortal && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                  Manage billing
                </Button>
              </div>
              {!isActive && (
                <p className="text-sm text-destructive mt-3">
                  Your API subscription isn't active — update billing to restore access.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="h-5 w-5" /> API keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              {justCreatedKey && (
                <NewKeyReveal plaintextKey={justCreatedKey} onDismiss={() => setJustCreatedKey(null)} />
              )}

              {status && status.keys.length > 0 ? (
                <div className="mb-6">
                  {status.keys.map((k) => (
                    <ApiKeyRow key={k.id} apiKey={k} onRevoke={handleRevoke} />
                  ))}
                </div>
              ) : (
                !justCreatedKey && <p className="text-sm text-muted-foreground mb-6">No keys yet.</p>
              )}

              <form onSubmit={handleCreateKey} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block" htmlFor="keyLabel">
                    New key label
                  </label>
                  <Input
                    id="keyLabel"
                    placeholder="e.g. Production"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    disabled={!isActive}
                  />
                </div>
                <Button type="submit" disabled={creating || !isActive}>
                  {creating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                  Generate key
                </Button>
              </form>
              {createError && <p className="text-sm text-destructive mt-2">{createError}</p>}
              {!isActive && (
                <p className="text-xs text-muted-foreground mt-2">
                  Reactivate your subscription to generate new keys.
                </p>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Need a different tier or a custom volume?{" "}
            <Link href="/developers" className="underline underline-offset-2">
              Compare plans
            </Link>{" "}
            or{" "}
            <Link href="/contact?topic=api-enterprise" className="underline underline-offset-2">
              contact us about Enterprise
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
