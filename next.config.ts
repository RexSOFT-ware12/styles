import type { NextConfig } from "next";

// Every product image is served either from this backend's own /uploads
// route or its gated /api/products/assets/:objectName route (see
// routes/products.js -> toPublicUrl). Rather than hardcoding just the
// current deployed hostname (which silently breaks every product image the
// day the backend moves/renames), derive the patterns for BOTH image routes
// from NEXT_PUBLIC_API_URL — the same env var the app already uses to talk
// to the backend — so moving the backend only means updating one env var,
// not this file too.
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function backendImagePatterns() {
  try {
    const { protocol, hostname, port } = new URL(apiUrl);
    const scheme = protocol.replace(":", "") as "http" | "https";
    return [
      { protocol: scheme, hostname, port, pathname: "/uploads/**" },
      {
        protocol: scheme,
        hostname,
        port,
        pathname: "/api/products/assets/**",
      },
    ];
  } catch {
    // Malformed NEXT_PUBLIC_API_URL — fall back to no derived patterns
    // rather than crashing the build; the hardcoded entries below still
    // cover the known deployments.
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    // Design Pattern products are served as SVGs (auto-traced from the
    // admin's PNG upload — see style-backend/src/lib/svgConvert.js). Next's
    // image optimizer refuses to process SVGs by default (they can embed
    // <script>), so this must be explicitly opted into. Our SVGs are
    // produced server-side by our own trusted backend from an admin upload,
    // not user-submitted markup rendered as-is, so this is safe here. The
    // CSP still sandboxes anything served through the optimizer as a
    // defense-in-depth measure.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Derived from NEXT_PUBLIC_API_URL — keeps working automatically if
      // the backend host changes.
      ...backendImagePatterns(),
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        // Local dev backend, when GCS is configured: images are served
        // through the gated /api/products/assets/:objectName route rather
        // than the private bucket directly.
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/api/products/assets/**",
      },
      {
        // Deployed backend's gated image route. GCS stays private — this
        // app-server endpoint (routes/products.js -> toPublicUrl) is the
        // only thing that ever reads from the bucket, so this is the actual
        // hostname+path every GCS-backed product image resolves to.
        protocol: "https",
        hostname: "stream-sell.de.r.appspot.com",
        pathname: "/api/products/assets/**",
      },
      {
        // Fallback local /uploads route when the backend is deployed but no
        // storage bucket is configured (e.g. the App Engine backend).
        protocol: "https",
        hostname: "stream-sell.de.r.appspot.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
