import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Download, RefreshCcw, X } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Download & Licensing — FabricNow",
  description: "What's in a FabricNow download, and what you can do with it.",
};

const allowed = [
  "Use a purchased file in your own personal or commercial garment, textile, or portfolio projects",
  "Use files in client work, as long as the source files themselves aren't handed over to the client",
  "Re-download your files anytime from My Purchases",
];

const notAllowed = [
  "Resell, redistribute, or sublicense the source files (the .zprj project or fabric texture) as a standalone asset",
  "Upload our source files to another marketplace or asset library",
  "Share your account or downloaded files with people who haven't purchased them",
];

export default function Licensing() {
  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              Download &amp; Licensing
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              What you get, and what you can do with it
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every purchase is a digital download with a straightforward
              license attached. Here&apos;s the plain-English version.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                What&apos;s in the download
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Each product is delivered as a single .zip file, typically
              containing a ready-to-open CLO3D <code className="bg-muted rounded px-1 py-0.5 text-sm font-mono">.zprj</code> project
              plus its fabric textures and any supporting assets. Check the
              individual product page for the exact contents and any
              software version notes before you buy.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RefreshCcw className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Re-downloading
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Once you&apos;ve purchased a product, it&apos;s yours to
              re-download anytime from{" "}
              <Link href="/account/purchases" className="text-primary underline underline-offset-2">
                My Purchases
              </Link>{" "}
              — no time limit, no extra charge.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">You can</h3>
                </div>
                <ul className="space-y-3">
                  {allowed.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <X className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold text-foreground">You can&apos;t</h3>
                </div>
                <ul className="space-y-3">
                  {notAllowed.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex gap-2">
                      <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Need a license for a whole team, or something not covered
                here? We&apos;re happy to work out something that fits.
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
