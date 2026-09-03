"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createCheckoutSession } from "@/lib/orders";
import { CreditCard, Download, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart } = useCart();
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to check out</h1>
        <p className="text-muted-foreground mb-6">
          These are digital downloads tied to your account, so you&apos;ll need to be signed in to purchase and access them later.
        </p>
        <Button asChild>
          <Link href="/signin?redirect=/checkout">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <Button asChild className="mt-4">
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(
        token,
        cart.map((item) => ({ productId: item.id, quantity: item.quantity }))
      );
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout");
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
      <p className="text-muted-foreground mb-8">
        Digital delivery — no shipping involved. Your files unlock instantly after payment.
      </p>

      {canceled && (
        <div className="mb-6 p-3 rounded-lg border border-yellow-300 bg-yellow-50 text-sm text-yellow-800">
          Checkout was canceled. Your cart is unchanged — you can try again whenever you&apos;re ready.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button size="lg" className="w-full" onClick={handleCheckout} disabled={submitting}>
            <CreditCard className="h-4 w-4 mr-2" />
            {submitting ? "Redirecting to payment..." : `Pay $${total.toFixed(2)}`}
          </Button>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-green-500" />
              <span>Payment is securely processed by Stripe</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Download className="h-4 w-4 text-blue-500" />
              <span>Instant download — no shipping, ever</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Your files stay available under &quot;My Purchases&quot;</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
