import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Blog — FabricNow",
  description: "Design tips, product news, and behind-the-scenes from FabricNow.",
};

export default function Blog() {
  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              Blog
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Notes on design, straight from the studio
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips for working faster in CLO3D, new product drops, and
              what we&apos;re building next.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto bg-muted/30">
            <CardContent className="p-12 text-center">
              <Newspaper className="h-8 w-8 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">
                First post coming soon
              </h2>
              <p className="text-muted-foreground mb-8">
                We&apos;re just getting the blog started. Subscribe to our
                newsletter at the bottom of the page and we&apos;ll let you
                know the moment something new goes up.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
