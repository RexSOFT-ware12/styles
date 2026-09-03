"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProducts } from "@/lib/products";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RelatedProductsProps {
  product: Product;
}

export default function RelatedProducts({ product }: RelatedProductsProps) {
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    getProducts({ category: product.category, limit: 8 }).then((all) => {
      if (cancelled) return;
      const filtered = all.filter((p) => String(p.id) !== String(product.id));
      // Fall back to any products if the category has nothing else in it.
      setRelated(filtered.slice(0, 4));
    });

    return () => {
      cancelled = true;
    };
  }, [product.id, product.category]);

  if (related.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
        <Button variant="ghost" asChild>
          <Link href="/" className="text-primary hover:text-primary/80">
            View All
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((relatedProduct) => (
          <Card
            key={relatedProduct.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <Link href={`/product/${relatedProduct.id}`}>
              <div className="aspect-square overflow-hidden bg-muted">
                <Image
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-1 mb-2">
                  {relatedProduct.name}
                </h3>
                {(relatedProduct.style || relatedProduct.fabric) && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {relatedProduct.style && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {relatedProduct.style}
                      </span>
                    )}
                    {relatedProduct.fabric && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {relatedProduct.fabric}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-lg font-bold text-primary">
                  ${relatedProduct.price.toFixed(2)}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
