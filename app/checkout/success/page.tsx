"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { clearCart } = useCart();

  // Payment succeeded (Stripe only sends us here after a successful session),
  // so the cart's job is done — clear it. The order itself is confirmed
  // server-side by the Stripe webhook, which is what actually unlocks the
  // download on the Purchases page.
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center">
      <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Payment received</h1>
      <p className="text-muted-foreground mb-1">
        Thanks for your purchase{orderId ? ` — order #${orderId.slice(0, 8)}` : ""}.
      </p>
      <p className="text-muted-foreground mb-8">
        It can take a few seconds for your files to unlock. Head to My Purchases to download them.
      </p>
      <div className="flex flex-col gap-3">
        <Button asChild size="lg">
          <Link href="/account/purchases">Go to My Purchases</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
