"use client";

import { Button } from "@/components/ui/button";
import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

/** Mobile-only bar that appears once the main Add to Cart button has scrolled out of view. */
export default function StickyBuyBar({
  name,
  price,
  compareAtPrice,
  disabled,
  adding,
  added,
  onAdd,
  anchorId,
}: {
  name: string;
  price: number;
  compareAtPrice?: number;
  disabled?: boolean;
  adding?: boolean;
  added?: boolean;
  onAdd: () => void;
  anchorId: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Re-query on every scroll so it keeps working if React re-creates the DOM node.
    const check = () => {
      const el = document.getElementById(anchorId);
      setShow(!!el && el.getBoundingClientRect().bottom < 80);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [anchorId]);

  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-[60] border-t bg-background/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="text-sm font-bold text-foreground">
            ${price.toFixed(2)}
            {compareAtPrice && compareAtPrice > price && (
              <span className="ml-2 text-xs font-normal text-muted-foreground line-through">${compareAtPrice.toFixed(2)}</span>
            )}
          </p>
        </div>
        <Button onClick={onAdd} disabled={disabled || adding} tabIndex={show ? 0 : -1} className="shrink-0">
          {added ? (
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Added</span>
          ) : (
            <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> {disabled ? "Unavailable" : "Add to Cart"}</span>
          )}
        </Button>
      </div>
    </div>
  );
}
