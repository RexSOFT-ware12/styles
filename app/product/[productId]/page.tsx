import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductLoadError from "@/components/product/ProductLoadError";
import ProductNotFound from "@/components/product/ProductNotFound";
import { merchantReturnPolicy, shippingDetails } from "@/lib/offerPolicies";
import { getProductByIdWithStatus } from "@/lib/products";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { cache } from "react";

interface PageProps {
  params: Promise<{ productId: string }>;
}

// generateMetadata and the page body both need the product; React's cache()
// dedupes identical calls within a single request/render pass so this is
// still just one network round-trip, not two.
const loadProduct = cache((productId: string) => getProductByIdWithStatus(productId));

/**
 * Server-rendered per-product metadata (title, description, OG/Twitter
 * tags). Previously the whole page was "use client" and fetched via
 * useEffect, so every product page shared the root layout's generic title —
 * bad for SEO and for shared-link/social previews, and every load also
 * showed a flash of skeleton before content appeared. This fetch (and the
 * one in the page body below) hit Next's fetch cache, so it isn't a second
 * network round-trip in practice.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const { product } = await loadProduct(productId);

  if (!product) {
    return {
      title: "Product not found — FabricNow",
    };
  }

  const description =
    product.description?.slice(0, 160) ||
    `${product.name} — CLO3D-ready fabric asset on FabricNow.`;

  return {
    title: `${product.name} — FabricNow`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image ? [{ url: product.image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;
  const { product, error } = await loadProduct(productId);

  if (error) return <ProductLoadError />;
  if (!product) return <ProductNotFound />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image, ...(product.images ?? [])].filter(Boolean),
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || "FabricNow" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      url: `${SITE_URL}/product/${productId}`,
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails,
      hasMerchantReturnPolicy: merchantReturnPolicy,
      availability: product.hasDigitalFile ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.rating && product.reviewCount
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } }
      : {}),
    // Real, approved customer reviews only (the API never returns anything else).
    ...(product.reviews?.length
      ? {
          review: product.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.reviewerName },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            reviewBody: r.comment,
            ...(r.createdAt ? { datePublished: r.createdAt.slice(0, 10) } : {}),
          })),
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductDetailClient product={product} />
    </>
  );
}
