"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductBreadcrumb() {
  const router = useRouter();

  const handleBack = () => {
    // Go back to wherever the visitor actually came from (the homepage's
    // "All Products" grid, the "/design-patterns" page, a search results
    // page, etc.) instead of always landing on the homepage. Only fall back
    // to "/" when there's nowhere in this tab's history to go back to (e.g.
    // someone opened the product page directly from a shared link).
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="mb-8">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Shop
      </Button>
    </nav>
  );
}
