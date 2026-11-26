"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { subscribeEmail } from "@/lib/store";
import { BellRing, Check } from "lucide-react";
import { useState } from "react";

/** Ask to be emailed when anything on the wishlist drops in price. */
export default function WishlistAlerts() {
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const address = email || user?.email || "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await subscribeEmail(address, { watchProductIds: wishlist.map((w) => w.id), source: "wishlist" });
      setMsg({ ok: true, text: "Done — we'll email you if anything on your wishlist drops in price." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Couldn't save your alert." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mb-8 flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground sm:w-64">
        <BellRing className="h-4 w-4 shrink-0 text-primary" />
        Get an email when a saved item goes on sale
      </div>
      <Input type="email" required placeholder="you@example.com" value={address} onChange={(e) => setEmail(e.target.value)} className="sm:flex-1" aria-label="Email for price alerts" />
      <Button type="submit" disabled={busy}>
        {msg?.ok ? <><Check className="mr-2 h-4 w-4" />Saved</> : busy ? "Saving…" : "Alert me"}
      </Button>
      {msg && <p role="status" className={`text-sm sm:basis-full ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>}
    </form>
  );
}
