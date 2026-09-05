"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { isSvgSrc } from "@/lib/utils";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Your wishlist is empty
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Tap the heart on any product to save it here for later.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wishlist</h1>
          <p className="text-muted-foreground mt-2">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <Button
          variant="ghost"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {wishlist.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <Link href={`/product/${item.id}`} className="block relative aspect-square bg-muted">
              {isSvgSrc(item.image) ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover bg-white"
                />
              ) : (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover"
                />
              )}
            </Link>
            <CardContent className="p-3 space-y-2">
              <Link href={`/product/${item.id}`}>
                <h2 className="text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                  {item.name}
                </h2>
              </Link>
              <span className="text-sm font-bold text-foreground block">
                ${item.price.toFixed(2)}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => addToCart(item)}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Add to Cart</span>
                  <span className="sm:hidden">Add</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromWishlist(item.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
