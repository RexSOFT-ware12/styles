import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

/**
 * Shown when the product fetch genuinely failed (network blip, backend
 * down) — as opposed to ProductNotFound, which is for a clean 404. Unlike
 * the old behavior (a permanent "Product not found" for any failure), this
 * offers a retry since the product may well exist.
 */
export default function ProductLoadError() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Couldn&apos;t load this product
        </h1>
        <p className="text-muted-foreground mb-6">
          Something went wrong reaching the catalog. This is likely temporary
          — please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <a href="">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
