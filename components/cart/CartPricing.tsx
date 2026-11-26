"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Quote } from "@/lib/store";
import { Check, Gift, Tag, X } from "lucide-react";
import { useState } from "react";

/** "Add 2 more to save 10%" nudge + the discount tiers. */
export function BundleBar({ quote }: { quote: Quote | null }) {
  if (!quote || quote.tiers.length === 0) return null;
  const { nextTier, volumePercent } = quote;
  const lastTier = quote.tiers[quote.tiers.length - 1];
  const target = nextTier ? nextTier.minItems : lastTier.minItems;
  const pct = Math.min(100, Math.round((quote.itemCount / target) * 100));
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <Gift className="h-4 w-4 text-primary" />
        {nextTier ? (
          <span>
            Add {nextTier.itemsNeeded} more item{nextTier.itemsNeeded === 1 ? "" : "s"} to save {nextTier.percent}%
          </span>
        ) : (
          <span>Bundle discount unlocked — {volumePercent}% off!</span>
        )}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {quote.tiers.map((t) => `${t.minItems}+ items: ${t.percent}% off`).join(" · ")}
      </p>
    </div>
  );
}

export function CouponBox({
  quote,
  code,
  onApply,
}: {
  quote: Quote | null;
  code: string;
  onApply: (code: string) => void;
}) {
  const [input, setInput] = useState("");
  const applied = quote?.couponCode;

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
        <span className="flex items-center gap-2">
          <Check className="h-4 w-4" /> {applied} applied (−${quote!.couponDiscount.toFixed(2)})
        </span>
        <button type="button" onClick={() => onApply("")} aria-label="Remove coupon" className="rounded p-1 hover:bg-green-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) onApply(input);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Discount code" className="pl-9 uppercase" aria-label="Discount code" />
        </div>
        <Button type="submit" variant="outline">Apply</Button>
      </form>
      {code && quote?.couponError && <p className="mt-2 text-xs text-destructive">{quote.couponError}</p>}
    </div>
  );
}
