import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Mail, Sparkles, Users } from "lucide-react";

export const metadata = {
  title: "Careers — FabricNow",
  description: "What we look for at FabricNow, and how to get in touch.",
};

const values = [
  {
    icon: Sparkles,
    title: "Craft over speed",
    description: "We'd rather ship one thing that works perfectly than ten that mostly do.",
  },
  {
    icon: Users,
    title: "Designers first",
    description: "Everything we build is judged by whether it actually saves a designer time.",
  },
  {
    icon: Heart,
    title: "Small, deliberate team",
    description: "We stay small on purpose, so everyone's work has real impact.",
  },
];

export default function Careers() {
  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              Careers
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Join us in building for designers
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;re a small team focused on making fabric and garment
              design faster for everyone who uses CLO3D.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
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

          <Card className="bg-muted/30 max-w-3xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No open roles right now
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                We don&apos;t have any positions open at the moment, but
                we&apos;re always glad to hear from people who care about
                design tools. Send us a note and what you&apos;re interested
                in, and we&apos;ll keep it on file.
              </p>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href="mailto:careers@fabricnow.com">
                  <Mail className="h-4 w-4 mr-2" />
                  careers@fabricnow.com
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
