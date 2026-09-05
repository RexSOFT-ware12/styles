"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { downloadPurchase, getCachedOrders, getMyOrders, Order } from "@/lib/orders";
import { Download, Loader2, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PurchasesPage() {
  const { user, token, loading: authLoading } = useAuth();
  // Seed from the in-memory cache so a repeat visit (e.g. navigating away
  // and back to this page) paints the last-known list immediately instead
  // of flashing the loading state again. The effect below still refetches
  // to keep it current — this only affects the very first paint.
  const [orders, setOrders] = useState<Order[] | null>(() =>
    token ? getCachedOrders(token) : null
  );
  const [error, setError] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    // If we already have cached orders for this token, show them right
    // away and revalidate quietly; otherwise this is the first load and
    // the spinner below is the real, unavoidable one.
    const cached = getCachedOrders(token);
    if (cached) setOrders(cached);

    getMyOrders(token)
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load your purchases"));
  }, [token]);

  const handleDownload = async (orderId: string, productId: string, name: string) => {
    if (!token) return;
    const key = `${orderId}:${productId}`;
    setDownloadingKey(key);
    try {
      await downloadPurchase(token, orderId, productId, `${name}.zip`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingKey(null);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to view your purchases</h1>
        <Button asChild className="mt-4">
          <Link href="/signin?redirect=/account/purchases">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">My Purchases</h1>
      <p className="text-muted-foreground mb-8">
        Every design you&apos;ve bought, ready to download whenever you need it.
      </p>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {orders === null && !error && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your orders...
        </div>
      )}

      {orders?.length === 0 && (
        <div className="text-center py-16">
          <PackageOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">You haven&apos;t purchased anything yet.</p>
          <Button asChild>
            <Link href="/">Browse products</Link>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()} · ${order.total.toFixed(2)}
                </p>
              </div>
              <Badge variant={order.status === "paid" ? "secondary" : "outline"}>
                {order.status === "paid" ? "Paid" : "Pending payment"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => {
                const key = `${order.id}:${item.productId}`;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 py-2 border-t border-border first:border-t-0 first:pt-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {order.status === "paid" ? (
                      <Button
                        size="sm"
                        onClick={() => handleDownload(order.id, item.productId, item.name)}
                        disabled={downloadingKey === key}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadingKey === key ? "Preparing..." : "Download"}
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">Awaiting payment</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
