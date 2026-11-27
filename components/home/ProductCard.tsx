"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn, isSvgSrc } from "@/lib/utils";
import { Bell, Check, Eye, Heart, ShoppingCart, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QuickView from "@/components/home/QuickView";
import { MAX_COMPARE, useCompare } from "@/context/CompareContext";
import { useEffect, useState } from "react";
import PinSaveButton from "@/components/pinterest/PinSaveButton";
import { pinnableImage, productPinDescription } from "@/lib/pinterest";

interface Product {
  id: number | string;
  image: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  category?: string;
  style?: string;
  fabric?: string;
  /** Mirrors the product detail page: no downloadable file means it can't
   *  actually be checked out yet, so "Add to Cart" is disabled here too. */
  hasDigitalFile?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [product.image]);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const { isComparing, toggle: toggleCompare } = useCompare();
  const comparing = isComparing(product.id);
  const [quickOpen, setQuickOpen] = useState(false);
  const onSale = !!product.compareAtPrice && product.compareAtPrice > product.price;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!toggleCompare(product.id)) alert(`You can compare up to ${MAX_COMPARE} products at a time.`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.hasDigitalFile) return;

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

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          name="Like Button"
          className={cn(
            "absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm hover:bg-background",
            isLiked && "opacity-100 text-destructive"
          )}
          onClick={handleToggleLike}
        >
          <Heart
            name="Like Icon"
            className={cn("h-3.5 w-3.5", isLiked && "fill-current")}
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label={comparing ? "Remove from comparison" : "Add to comparison"}
          aria-pressed={comparing}
          title={comparing ? "Remove from comparison" : "Compare"}
          className={cn(
            "absolute top-11 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm hover:bg-background",
            comparing && "opacity-100 text-primary"
          )}
          onClick={handleCompare}
        >
          <Scale className="h-3.5 w-3.5" />
        </Button>

        {!isSvgSrc(product.image) && !imageError && (
          <PinSaveButton
            variant="icon"
            url={`/product/${product.id}`}
            media={pinnableImage(product.image)}
            description={productPinDescription(product)}
            className="absolute top-20 right-2 z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 hidden sm:inline-flex"
          />
        )}

        <Link href={`/product/${product.id}`} className="block relative">
          {onSale && (
            <div className="absolute left-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-destructive-foreground shadow-md">
              <Bell
                aria-hidden="true"
                className="h-3.5 w-3.5 origin-top motion-safe:group-hover:animate-[bell-ring_0.7s_ease-in-out]"
              />
              On Sale
            </div>
          )}
          <div className="relative aspect-square overflow-hidden bg-muted">
            {!imageError ? (
              isSvgSrc(product.image) ? (
                // Plain <img> for SVGs — bypasses next/image's optimizer
                // entirely (see lib/utils.ts:isSvgSrc for why).
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 bg-white"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="px-2 text-center text-xs text-muted-foreground">
                  Image not available
                </span>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickOpen(true);
              }}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Quick View
            </Button>
          </div>
        </Link>
      </div>

      <CardContent className="p-3 space-y-2">
        <Link href={`/product/${product.id}`}>
          <h2 className="text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h2>
        </Link>

        {(product.style || product.fabric) && (
          <div className="flex flex-wrap items-center gap-1 min-h-0">
            {product.style && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary truncate max-w-full">
                {product.style}
              </span>
            )}
            {product.fabric && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-full">
                {product.fabric}
              </span>
            )}
          </div>
        )}

        <span className="text-sm font-bold text-foreground block">
          ${product.price.toFixed(2)}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <>
              <span className="ml-2 text-xs font-normal text-muted-foreground line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
              <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </span>
            </>
          )}
        </span>

        <Button
          size="sm"
          className={cn(
            "w-full transition-all duration-300",
            justAdded
              ? "bg-green-600 text-white hover:bg-green-600"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={handleAddToCart}
          disabled={isAdding || !product.hasDigitalFile}
        >
          {isAdding ? (
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Adding...</span>
            </div>
          ) : justAdded ? (
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Added!</span>
            </div>
          ) : !product.hasDigitalFile ? (
            <span className="text-xs sm:text-sm">Unavailable</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add to Cart</span>
            </div>
          )}
        </Button>
      </CardContent>
      {quickOpen && <QuickView product={product} onClose={() => setQuickOpen(false)} />}
    </Card>
  );
}
