import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Press — FabricNow",
  description: "Media and press inquiries for FabricNow.",
};

export default function Press() {
  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              Press
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Press &amp; media inquiries
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Writing about FabricNow, or want to feature one of our
              designers? We&apos;d love to help.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Get in touch
              </h2>
              <p className="text-muted-foreground mb-8">
                For interviews, brand assets, or anything else press-related,
                reach out directly and we&apos;ll get back to you as soon as
                we can.
              </p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href="mailto:press@fabricnow.com">
                  <Mail className="h-4 w-4 mr-2" />
                  press@fabricnow.com
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
