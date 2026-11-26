"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getReferral, type ReferralInfo } from "@/lib/store";
import { Check, Copy, Gift } from "lucide-react";
import { useEffect, useState } from "react";

export default function ReferralCard() {
  const { token } = useAuth();
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    getReferral(token).then(setInfo).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load"));
  }, [token]);

  const copy = async () => {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" /> Invite friends, get 10% off
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Friends who join through your link get 10% off their first order. When they make their first purchase, you get a 10% code too.
        </p>
        {error && <p className="text-destructive">{error}</p>}
        {info && (
          <>
            <div className="flex gap-2">
              <input readOnly value={info.link} aria-label="Your referral link" className="min-w-0 flex-1 rounded-md border bg-muted/40 px-3 py-2 text-sm" onFocus={(e) => e.currentTarget.select()} />
              <Button type="button" variant="outline" onClick={copy}>
                {copied ? <><Check className="mr-2 h-4 w-4" />Copied</> : <><Copy className="mr-2 h-4 w-4" />Copy</>}
              </Button>
            </div>
            <p className="text-muted-foreground">
              {info.friendsJoined} joined · {info.friendsPurchased} purchased
            </p>
            {info.rewards.filter((r) => !r.used).length > 0 && (
              <div>
                <p className="mb-1 font-medium">Your reward codes</p>
                <ul className="space-y-1">
                  {info.rewards.filter((r) => !r.used).map((r) => (
                    <li key={r.code} className="font-mono text-xs">
                      {r.code}
                      {r.expiresAt && <span className="ml-2 text-muted-foreground">expires {new Date(r.expiresAt).toLocaleDateString()}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
