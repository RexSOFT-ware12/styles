import CookieConsentBanner from "@/components/layout/CookieConsentBanner";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import PremiumTrialBanner from "@/components/layout/PremiumTrialBanner";
import PromoDialog from "@/components/layout/PromoDialog";
import SiteChat from "@/components/layout/SiteChat";
import { AuthProvider } from "@/context/AuthContext";
import { CompareProvider } from "@/context/CompareContext";
import ReferralCapture from "@/components/layout/ReferralCapture";
import CompareBar from "@/components/compare/CompareBar";
import { CartProvider } from "@/context/CartContext";
import { SiteChatProvider } from "@/context/SiteChatContext";
import { WishlistProvider } from "@/context/WishlistContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { getPinterestSettings } from "@/lib/pinterest";
import PinterestTag from "@/components/pinterest/PinterestTag";
import PinterestWelcome from "@/components/pinterest/PinterestWelcome";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "FabricNow",
  openGraph: {
    type: "website",
    siteName: "FabricNow",
    url: SITE_URL,
    title: "FabricNow — CLO3D Fabric & Garment Files",
    description:
      "Studio-quality fabric assets and ready-to-use CLO3D garment files. Instant download, permanent access.",
  },
  twitter: { card: "summary_large_image" },
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

// Adds Pinterest's domain-verification tag when a code is set (Admin → Pinterest
// or NEXT_PUBLIC_PINTEREST_DOMAIN_VERIFY), which is what lets Pinterest claim the site.
export async function generateMetadata(): Promise<Metadata> {
  const { domainVerify } = await getPinterestSettings();
  return domainVerify ? { ...baseMetadata, other: { "p:domain_verify": domainVerify } } : baseMetadata;
}

async function PinterestTagLoader() {
  const { tagId } = await getPinterestSettings();
  return tagId ? <PinterestTag tagId={tagId} /> : null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('fabricnow_theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}",
          }}
        />
      </head>
      <body
        className={`${inter.className}  antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
              <SiteChatProvider>
                <Suspense fallback={null}>
                  <PinterestWelcome />
                  <PremiumTrialBanner />
                  <Header />
                </Suspense>
                <main className="flex-grow">{children}</main>
                <Footer />
                <SiteChat />
                <CookieConsentBanner />
                <PromoDialog />
                <CompareBar />
                <Suspense fallback={null}>
                  <PinterestTagLoader />
                </Suspense>
                <Suspense fallback={null}>
                  <ReferralCapture />
                </Suspense>
              </SiteChatProvider>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
