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
import { useEffect, useState } from "react";
import ProductSpecs from "@/components/product/ProductSpecs";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import StickyBuyBar from "@/components/product/StickyBuyBar";
import { trackRecent } from "@/lib/recentlyViewed";
import PinterestIcon from "@/components/pinterest/PinterestIcon";
import PinSaveButton from "@/components/pinterest/PinSaveButton";
import { pinnableImage, productPinDescription } from "@/lib/pinterest";
import { SITE_URL } from "@/lib/site";
import CloExtras from "@/components/product/CloExtras";
import AddOnPicker from "@/components/product/AddOnPicker";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart, cart } = useCart();
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const inCart = (id: string) => cart.some((c) => String(c.id) === id);
  const toggleAddOn = (id: string) => setAddOnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => {
    trackRecent({ id: product.id, name: product.name, price: product.price, image: product.image });
  }, [product.id, product.name, product.price, product.image]);
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
    // Ticked tech pack / DXF add-ons go into the cart as their own lines.
    for (const a of product.addOns ?? []) {
      if (addOnIds.includes(a.id) && a.hasDigitalFile) {
        addToCart({ id: a.id, name: `${a.name} — ${product.name}`, price: a.price, image: a.image || product.image });
      }
    }
    setAddOnIds([]);

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

  const pinPage = `${SITE_URL}/product/${product.id}`;
  const pinDescription = productPinDescription(product);
  const pinImage = pinnableImage(product.image, ...(product.heroImages ?? []), ...(product.images ?? []));

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
          pin={{ url: pinPage, description: pinDescription, fallbackImage: pinImage }}
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
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-700">
                  Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          <ProductDescription description={product.description} />

          <CloExtras product={product} />

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

          {!!product.addOns?.length && product.hasDigitalFile && (
            <AddOnPicker addOns={product.addOns} selected={addOnIds} inCart={inCart} onToggle={toggleAddOn} />
          )}

          <div className="space-y-4">
            <div id="buy-buttons" className="flex flex-col sm:flex-row gap-4">
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
                    {addOnIds.length
                      ? `Add to Cart · $${(product.price + (product.addOns ?? []).filter((x) => addOnIds.includes(x.id)).reduce((t, x) => t + x.price, 0)).toFixed(2)}`
                      : "Add to Cart"}
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

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
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

              <PinSaveButton variant="inline" url={pinPage} media={pinImage} description={pinDescription} />

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

      <ProductSpecs product={product} />

      <Features />

      <ProductReviews
        productId={product.id}
        hasDigitalFile={product.hasDigitalFile}
        reviews={product.reviews}
        rating={product.rating}
        reviewCount={product.reviewCount}
      />

      <RelatedProducts product={product} />

      <RecentlyViewed excludeId={product.id} />

      <StickyBuyBar
        name={product.name}
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        disabled={!product.hasDigitalFile}
        adding={isAdding}
        added={justAdded}
        onAdd={handleAddToCart}
        anchorId="buy-buttons"
      />

      <FiboAssistant product={product} />
    </div>
  );
}
