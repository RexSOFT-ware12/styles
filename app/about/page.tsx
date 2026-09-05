import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileCheck, Layers, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us — FabricNow",
  description: "Studio-quality fabric and garment files for CLO3D, built by designers for designers.",
};

const values = [
  {
    icon: Layers,
    title: "Studio-quality assets",
    description:
      "Every fabric and garment file is built to hold up under real production lighting and draping, not just look good in a thumbnail.",
  },
  {
    icon: FileCheck,
    title: "Ready to open",
    description:
      "No re-mapping textures or fixing broken UVs — files are packaged and tested to drop straight into CLO3D.",
  },
  {
    icon: Download,
    title: "Instant, permanent access",
    description:
      "Your download unlocks the moment you pay, and stays in My Purchases so you can grab it again anytime.",
  },
];

export default function About() {
  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              About FabricNow
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Built by designers,{" "}
              <span className="text-primary block lg:inline lg:ml-4">
                for designers
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              FabricNow makes studio-quality fabric textures and ready-to-use
              CLO3D garment files, so you can spend less time prepping
              assets and more time designing.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why we started FabricNow
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every fashion designer knows the tax of getting from idea to
              3D render: hunting for the right fabric, cleaning up a
              pattern, fighting with a texture that looked fine in the
              thumbnail and terrible once draped. FabricNow exists to remove
              that tax — every file we sell is built, tested, and packaged
              so it works the moment you open it in CLO3D.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-3 bg-primary/10 rounded-lg mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Ready to start designing?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Browse the collection and find your next fabric or garment
                file — instant download, no shipping, no waiting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/">Browse Products</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
