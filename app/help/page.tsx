import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Download, FileQuestion, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Help Center — FabricNow",
  description: "Answers to common questions about orders, downloads, and your account.",
};

const categories = [
  {
    title: "Orders & Downloads",
    icon: Download,
    questions: [
      {
        q: "How do I get my files after I pay?",
        a: "There's no shipping — your download unlocks instantly on the confirmation page and stays available from My Purchases, so you can grab it again anytime.",
      },
      {
        q: "Where can I re-download something I already bought?",
        a: "Go to My Purchases from your account menu. Every paid order is listed there with a Download button next to each item.",
      },
      {
        q: "My download failed partway through — what do I do?",
        a: "Just try the Download button again from My Purchases; it starts a fresh download rather than resuming a broken one. If it keeps failing, contact us and we'll sort it out.",
      },
      {
        q: "Can I download a product to more than one computer?",
        a: "Yes — once purchased, you can re-download it from My Purchases as many times as you need on your own devices.",
      },
    ],
  },
  {
    title: "Files & Compatibility",
    icon: FileQuestion,
    questions: [
      {
        q: "What's inside the download?",
        a: "A single .zip containing the CLO3D .zprj project file plus its fabric, pattern, and texture assets — open it straight in CLO3D, no extra setup.",
      },
      {
        q: "What software do I need?",
        a: "Our garment files are built for CLO3D. Check the product page for any version notes before you buy if you're on an older release.",
      },
      {
        q: "Can I use these files in commercial projects?",
        a: "Yes, within the terms of our license — see Download & Licensing for exactly what's allowed.",
      },
    ],
  },
  {
    title: "Account & Billing",
    icon: ShieldCheck,
    questions: [
      {
        q: "How do I reset my password?",
        a: "Use the \"Forgot password\" link on the sign-in page to get a reset link sent to your email.",
      },
      {
        q: "What payment methods do you accept?",
        a: "All major credit and debit cards, processed securely through Stripe.",
      },
      {
        q: "What's your refund policy?",
        a: "Since each purchase unlocks a digital file immediately, we don't offer refunds once a download has started. See Returns & Exchanges for the full details and what we can do if a file is broken or wrong.",
      },
    ],
  },
];

export default function HelpCenter() {
  return (
    <div className="bg-background">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-primary text-primary-foreground">
              Help Center
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              How can we help?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Answers to the questions we hear most about orders, files, and
              your account.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  {category.questions.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-lg border border-border bg-card px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                        {item.q}
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Card className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-10 text-center">
              <Mail className="h-6 w-6 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Still stuck?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our support team is happy to help with anything not covered
                here.
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
