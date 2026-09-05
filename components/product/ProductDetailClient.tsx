"use client";

import Features from "@/components/product/Features";
import FiboAssistant from "@/components/product/FiboAssistant";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductDescription from "@/components/product/ProductDescription";
import ProductGallery from "@/components/product/ProductGallery";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import {
  AlertCircle,
  Check,
  Download,
  Heart,
  Link as LinkIcon,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// No Pinterest mark in lucide-react, so it's drawn as a small inline SVG here.
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.869.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.809-2.428.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.579 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.744 2.281a.3.3 0 0 1 .069.288c-.076.315-.245.995-.278 1.134-.043.183-.144.222-.332.134-1.24-.577-2.016-2.389-2.016-3.845 0-3.13 2.274-6.006 6.556-6.006 3.443 0 6.12 2.454 6.12 5.734 0 3.421-2.157 6.174-5.152 6.174-1.006 0-1.951-.523-2.274-1.14l-.618 2.357c-.224.861-.828 1.94-1.233 2.598A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  const handleAddToCart = async () => {
    setIsAdding(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    setIsAdding(false);
    setJustAdded(true);

    setTimeout(() => setJustAdded(false), 2000);
  };

  // Previously fired addToCart without awaiting it and navigated on a
  // separate, unrelated setTimeout — so "Buy Now" only happened to land
  // after the item was in the cart, and would silently break if the
  // add-to-cart timing ever changed. Awaiting it directly ties the
  // navigation to the actual completion of the add, not a guessed delay.
  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on FabricNow`,
      url: window.location.href,
    };

    // Native share sheet on mobile / supported browsers.
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet — nothing to do.
      }
      return;
    }

    // Fallback: copy the link to the clipboard.
    try {
      await navigator.clipboard.writeText(shareData.url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      // Neither native share nor clipboard write worked (e.g. clipboard
      // permission denied, or an older browser) — surface that instead of
      // failing silently, so the user isn't left thinking nothing happened.
      setShareState("failed");
      setTimeout(() => setShareState("idle"), 2500);
    }
  };

  const isLiked = isInWishlist(product.id);
  const displayRating = product.rating ?? null;
  const displayReviewCount = product.reviewCount ?? product.reviews?.length ?? 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductBreadcrumb />

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <ProductGallery
          name={product.name}
          image={product.image}
          heroImages={product.heroImages}
          fabricImage={product.fabricImage}
          images={product.images}
        />

        <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {product.name}
          </h1>
          {displayRating !== null && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(displayRating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({displayRating.toFixed(1)}) • {displayReviewCount}{" "}
                {displayReviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}

          {(product.style || product.fabric || product.color) && (
            <div className="flex flex-wrap items-center gap-2">
              {product.style && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Style: {product.style}
                </span>
              )}
              {product.fabric && (
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                  Fabric: {product.fabric}
                </span>
              )}
              {product.color && (
                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                  Color: {product.color}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <ProductDescription description={product.description} />

          {product.hasDigitalFile && product.digitalFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 w-fit">
              <Download className="h-4 w-4 text-primary" />
              <span>
                Includes {product.digitalFile.originalName}
                {typeof product.digitalFile.size === "number" &&
                  ` (${(product.digitalFile.size / (1024 * 1024)).toFixed(1)} MB)`}
              </span>
            </div>
          )}

          {!product.hasDigitalFile && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
              This product doesn&apos;t have a downloadable file attached yet — check back soon.
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className={cn(
                  "flex-1 transition-all duration-300",
                  justAdded
                    ? "bg-green-600 text-white hover:bg-green-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={handleAddToCart}
                disabled={isAdding || !product.hasDigitalFile}
              >
                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </div>
                ) : justAdded ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Added to Cart!
                  </div>
                ) : !product.hasDigitalFile ? (
                  "Unavailable"
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </div>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={!product.hasDigitalFile || isAdding}
                className="flex-1"
              >
                Buy Now
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleWishlist}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isLiked && "text-destructive"
                )}
              >
                <Heart
                  className={cn("h-4 w-4 mr-2", isLiked && "fill-current")}
                />
                {isLiked ? "In Wishlist" : "Add to Wishlist"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
              >
                {shareState === "copied" ? (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link copied!
                  </>
                ) : shareState === "failed" ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Couldn&apos;t share
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </>
                )}
              </Button>

              {product.pinterestUrl && (
                <a
                  href={product.pinterestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Pinterest"
                  aria-label="View on Pinterest"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#E60023] transition-colors group"
                >
                  <PinterestIcon className="h-5 w-5 text-[#E60023]" />
                  <span className="hidden group-hover:inline">
                    View on Pinterest
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <Features />

      <ProductReviews
        productId={product.id}
        hasDigitalFile={product.hasDigitalFile}
        reviews={product.reviews}
        rating={product.rating}
        reviewCount={product.reviewCount}
      />

      <RelatedProducts product={product} />

      <FiboAssistant product={product} />
    </div>
  );
}
