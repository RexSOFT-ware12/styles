"use client";

import Features from "@/components/product/Features";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductNotFound from "@/components/product/ProductNotFound";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import {
  Check,
  Download,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Product() {
  const { addToCart } = useCart();
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!productId) return;

    getProductById(productId as string).then((result) => {
      if (!cancelled) setProduct(result);
    });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (product === undefined) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-muted-foreground">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const handleAddToCart = async () => {
    setIsAdding(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    setIsAdding(false);
    setJustAdded(true);

    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push("/cart"), 500);
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductBreadcrumb />

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="w-full max-w-[500px] mx-auto flex flex-col items-center px-4">
            <div className="rounded-xl shadow-lg overflow-hidden mb-4 w-full">
              <Image
                src={product.image}
                alt="Selected product"
                width={600}
                height={600}
                priority
                fetchPriority="high"
                className="rounded-xl object-cover w-full h-auto max-h-[500px]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              (4.8) • 127 reviews
            </span>
          </div>

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
            {typeof product.stock === "number" && (
              <span
                className={cn(
                  "text-sm font-medium",
                  product.stock > 15
                    ? "text-green-600"
                    : product.stock > 0
                    ? "text-amber-600"
                    : "text-destructive"
                )}
              >
                {product.stock > 15
                  ? "In stock"
                  : product.stock > 0
                  ? `Only ${product.stock} left`
                  : "Out of stock"}
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

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
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("increment")}
                    className="h-10 w-10 rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

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
                disabled={!product.hasDigitalFile}
                className="flex-1"
              >
                Buy Now
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isLiked && "text-destructive"
                )}
              >
                <Heart
                  className={cn("h-4 w-4 mr-2", isLiked && "fill-current")}
                />
                Add to Wishlist
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Features />

      <RelatedProducts product={product} />
    </div>
  );
}
