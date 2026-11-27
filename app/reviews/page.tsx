import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getReviewsPage, getReviewSummary } from "@/lib/store";
import { BadgeCheck, Star } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Customer reviews — FabricNow",
  description: "Read what designers say about FabricNow. Every review is written by a customer and approved by our team before it is shown.",
};

function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${className} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);
  const [summary, list] = await Promise.all([getReviewSummary(), getReviewsPage(page, 20)]);
  const max = Math.max(1, ...Object.values(summary.distribution));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Badge className="mb-4">Customer reviews</Badge>
      <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">What designers say about FabricNow</h1>
      <p className="mb-8 text-muted-foreground">
        Reviews are written by customers. Our team approves each one before it appears, and we don&apos;t edit the rating.
      </p>

      <div className="mb-10 grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="text-center sm:pr-6">
          <div className="text-5xl font-bold text-foreground">{summary.average ? summary.average.toFixed(1) : "–"}</div>
          {summary.average ? <Stars value={summary.average} className="mx-auto h-5 w-5" /> : null}
          <div className="mt-1 text-sm text-muted-foreground">
            {summary.count ? `${summary.count} review${summary.count === 1 ? "" : "s"}` : "No reviews yet"}
          </div>
        </div>
        <div className="space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((n) => (
            <div key={n} className="flex items-center gap-3 text-sm">
              <span className="w-10 text-muted-foreground">{n} star</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${(summary.distribution[n] / max) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-muted-foreground">{summary.distribution[n]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{summary.count ? "Latest reviews" : "Be the first to review"}</h2>
        <Button asChild>
          <Link href="/share-experience">Write a review</Link>
        </Button>
      </div>

      {list.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No reviews have been published yet. Used FabricNow? Tell other designers how it went.
        </p>
      ) : (
        <ul className="space-y-4">
          {list.data.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Stars value={r.rating} />
                {r.createdAt && (
                  <time className="text-xs text-muted-foreground" dateTime={r.createdAt}>
                    {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </time>
                )}
              </div>
              <p className="whitespace-pre-line text-foreground">{r.quote}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{r.name}</span>
                {r.role && <span>· {r.role}</span>}
                {r.verifiedBuyer && (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <BadgeCheck className="h-4 w-4" /> Verified buyer
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {(page > 1 || list.hasMore) && (
        <nav className="mt-8 flex justify-between" aria-label="Pagination">
          {page > 1 ? <Link className="text-primary hover:underline" href={`/reviews?page=${page - 1}`}>← Newer</Link> : <span />}
          {list.hasMore ? <Link className="text-primary hover:underline" href={`/reviews?page=${page + 1}`}>Older →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
