"use client";

import ProductCard from "@/components/home/ProductCard";
import ProductCardSkeleton from "@/components/home/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { fetchOnboardingPicks } from "@/lib/onboarding";
import { fetchTaxonomies } from "@/lib/taxonomies";
import { useEntitlement } from "@/lib/useEntitlement";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { ArrowRight, Palette, Scissors, Sparkles, Wand2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "New to CLO3D", blurb: "Show me the basics as I go" },
  { id: "some-experience", label: "Used it a bit", blurb: "I know my way around" },
  { id: "pro", label: "Pro", blurb: "Skip the hand-holding" },
];

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const { user, token, loading: authLoading } = useAuth();
  const { entitlement } = useEntitlement(token);

  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [styleOptions, setStyleOptions] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");

  const [picksLoading, setPicksLoading] = useState(false);
  const [picksError, setPicksError] = useState<string | null>(null);
  const [intro, setIntro] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);

  // Not signed in (e.g. someone hits /welcome directly, or their session
  // expired mid-flow) — nothing personal to show, so bounce to signup.
  useEffect(() => {
    if (!authLoading && !user) router.replace("/signup");
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchTaxonomies()
      .then((t) => setStyleOptions(t.styles))
      .catch(() => setStyleOptions([]));
  }, []);

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const goToPicks = async () => {
    setStep(2);
    setPicksLoading(true);
    setPicksError(null);
    try {
      if (!token) throw new Error("Session expired — please sign in again.");
      const result = await fetchOnboardingPicks(token, {
        styles: selectedStyles,
        experience,
      });
      setIntro(result.intro);
      setProducts(result.products);
    } catch (err) {
      setPicksError(
        err instanceof Error ? err.message : "Couldn't load your picks — here's the storefront instead."
      );
    } finally {
      setPicksLoading(false);
    }
  };

  const finish = () => router.push(redirectTo);

  const trialDaysLeft = entitlement?.trialDaysLeft ?? 3;

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === step ? "w-8 bg-primary" : "w-4 bg-muted"
            )}
          />
        ))}
      </div>

      {step === 0 && (
        <Card className="text-center">
          <CardContent className="py-12 px-6 sm:px-12 space-y-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                Welcome to FabricNow{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto text-balance">
                You&apos;ve got full access to the Garment Tool, Pose Tool, and SVG
                customization for the next{" "}
                <span className="font-semibold text-foreground">
                  {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"}
                </span>
                , free.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs text-muted-foreground">
              <div className="flex flex-col items-center gap-1.5">
                <Scissors className="h-4 w-4 text-primary" />
                Garment Tool
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Wand2 className="h-4 w-4 text-primary" />
                Pose Tool
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Palette className="h-4 w-4 text-primary" />
                SVG Customization
              </div>
            </div>
            <Button size="lg" onClick={() => setStep(1)} className="gap-2">
              Let&apos;s set you up <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <button
                type="button"
                onClick={finish}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Skip for now
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="py-10 px-6 sm:px-10 space-y-8">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                What do you design?
              </h2>
              <p className="text-sm text-muted-foreground">
                Pick as many as fit — we&apos;ll use this to shortlist products for you.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {styleOptions.length === 0 && (
                <p className="text-sm text-muted-foreground">Loading styles…</p>
              )}
              {styleOptions.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                    selectedStyles.includes(style)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-accent"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-center text-sm font-medium text-foreground">
                Your CLO3D experience
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setExperience(level.id)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors",
                      experience === level.id
                        ? "border-primary bg-primary/5"
                        : "border-input hover:bg-accent"
                    )}
                  >
                    <div className="font-medium text-sm text-foreground">{level.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{level.blurb}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={finish}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Skip for now
              </button>
              <Button
                onClick={goToPicks}
                disabled={!selectedStyles.length || !experience}
                className="gap-2"
              >
                Show me picks <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-2 px-4">
            <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            {picksLoading ? (
              <p className="text-muted-foreground">Fibo is picking a few things for you…</p>
            ) : (
              <p className="text-foreground max-w-xl mx-auto text-balance">
                {picksError ? picksError : intro}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {picksLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {!picksLoading && (
            <div className="flex justify-center pt-2">
              <Button size="lg" onClick={finish} className="gap-2">
                Start browsing FabricNow <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense>
      <WelcomeContent />
    </Suspense>
  );
}
