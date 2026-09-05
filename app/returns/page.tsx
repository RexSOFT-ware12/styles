import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Copy, FileWarning, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Returns & Exchanges — FabricNow",
  description: "Our policy on refunds and how we handle file problems.",
};

const cases = [
  {
    icon: FileWarning,
    title: "A file won't open or is corrupted",
    description:
      "Contact us with your order number and we'll get you a working copy of the file, no questions asked.",
  },
  {
    icon: AlertTriangle,
    title: "You received the wrong product",
    description:
      "Let us know which product you meant to buy and we'll sort out the correct file or a fix to your order.",
  },
  {
    icon: Copy,
    title: "You were charged twice for the same order",
    description:
      "Send us both order numbers (or the charge dates) and we'll refund the duplicate.",
  },
];

export default function Returns() {
  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              Returns &amp; Exchanges
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Our refund policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every product on FabricNow is a digital download, so
              &quot;returns&quot; work a little differently than they would
              for a physical item.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-12">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Why we don&apos;t offer standard refunds
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Because your download unlocks the moment your payment
              succeeds, there&apos;s no way to &quot;return&quot; a digital
              file the way you would send back a physical product. For that
              reason, we generally don&apos;t offer refunds once a download
              has started.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">
              When we&apos;ll still help
            </h2>
            <div className="space-y-4">
              {cases.map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-10 text-center">
              <Mail className="h-6 w-6 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Something wrong with an order?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Reach out with your order number and we&apos;ll get it
                sorted as quickly as we can.
              </p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
