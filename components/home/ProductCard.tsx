"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn, isSvgSrc } from "@/lib/utils";
import { Check, Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Product {
  id: number | string;
  image: string;
  name: string;
  price: number;
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

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);

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

        <Link href={`/product/${product.id}`} className="block relative">
          <div className="aspect-square overflow-hidden bg-muted">
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
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-muted-foreground text-xs text-center px-2">
                  Image not available
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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
    </Card>
  );
}
