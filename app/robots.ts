import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or one-off pages nobody should land on from Google.
        disallow: ["/account", "/cart", "/checkout", "/signin", "/signup", "/welcome", "/wishlist", "/compare"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
