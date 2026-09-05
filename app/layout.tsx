import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SiteChat from "@/components/layout/SiteChat";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SiteChatProvider } from "@/context/SiteChatContext";
import { WishlistProvider } from "@/context/WishlistContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FabricNow — CLO3D Fabric & Garment Files",
  description:
    "Studio-quality fabric assets and ready-to-use CLO3D garment files. Download a .zprj project, drop it in, and start designing in minutes.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}  antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SiteChatProvider>
                <Suspense fallback={null}>
                  <Header />
                </Suspense>
                <main className="flex-grow">{children}</main>
                <Footer />
                <SiteChat />
              </SiteChatProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
