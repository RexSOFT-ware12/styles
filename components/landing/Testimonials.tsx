import { getTestimonials } from "@/lib/store";
import { Star } from "lucide-react";
import Link from "next/link";

/** Real, admin-approved customer quotes from the backend. Hidden until at least one is approved. */
export default async function Testimonials() {
  const items = await getTestimonials();
  if (items.length === 0) return null;
  return (
    <section className="bg-muted/40 px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">What designers say</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.slice(0, 6).map((t) => (
            <figure key={t.id} className="rounded-2xl border bg-card p-6">
              <div className="mb-3 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold text-foreground">{t.name}</span>
                {t.role && <span className="text-muted-foreground"> · {t.role}</span>}
                {t.verifiedBuyer && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">Verified buyer</span>}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Used FabricNow? <Link href="/share-experience" className="font-medium text-primary hover:underline">Share your experience</Link>
        </p>
      </div>
    </section>
  );
}
