"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { submitProductReview } from "@/lib/products";
import type { ProductReview } from "@/types/product";
import { BadgeCheck, ChevronDown, Loader2, Star } from "lucide-react";
import { useMemo, useState } from "react";

const INITIAL_VISIBLE = 6;
const SHOW_MORE_STEP = 6;

function StarRow({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(rating) ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
      ))}
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function ratingBreakdown(reviews: ProductReview[]) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const bucket = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    counts[bucket] += 1;
  });
  const total = reviews.length || 1;
  return counts.map((c) => Math.round((c / total) * 100)).reverse();
}

export default function ProductReviews({
  productId,
  hasDigitalFile = false,
  reviews = [],
  rating,
  reviewCount,
}: {
  productId: string | number;
  hasDigitalFile?: boolean;
  reviews?: ProductReview[];
  rating?: number | null;
  reviewCount?: number;
}) {
  const { user, token } = useAuth();
  const [localReviews, setLocalReviews] = useState(reviews);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const count = localReviews.length;
  const avg = useMemo(() => {
    if (!localReviews.length) return rating ?? 0;
    return Math.round((localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length) * 10) / 10;
  }, [localReviews, rating]);
  const breakdown = ratingBreakdown(localReviews);
  const visibleReviews = localReviews.slice(0, visibleCount);
  const hasMore = visibleCount < localReviews.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!token) {
      window.location.href = `/signin?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (!selectedRating) {
      setMessage({ type: "error", text: "Please choose a star rating." });
      return;
    }
    if (!comment.trim()) {
      setMessage({ type: "error", text: "Please write a short review." });
      return;
    }

    setSubmitting(true);
    try {
      const review = await submitProductReview(productId, token, { rating: selectedRating, comment: comment.trim() });
      setLocalReviews((current) => [review, ...current]);
      setSelectedRating(0);
      setComment("");
      setShowForm(false);
      setMessage({ type: "success", text: "Thanks! Your verified-purchase review has been added." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not submit your review." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-16" aria-labelledby="reviews-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 id="reviews-heading" className="text-2xl font-bold text-foreground">Customer Reviews</h2>
        {hasDigitalFile && (
          <Button variant="outline" onClick={() => { setMessage(null); setShowForm((v) => !v); }}>
            {showForm ? "Close review form" : "Write a review"}
          </Button>
        )}
      </div>

      {showForm && hasDigitalFile && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-1">Share your experience</h3>
            <p className="text-sm text-muted-foreground mb-5">Reviews are available to customers who purchased this digital product.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your rating</label>
                <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setSelectedRating(star)} aria-label={`${star} star${star > 1 ? "s" : ""}`} aria-pressed={selectedRating === star} className="p-1">
                      <Star className={`h-7 w-7 ${star <= selectedRating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="product-review" className="text-sm font-medium mb-2 block">Your review</label>
                <Textarea id="product-review" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={4} placeholder="Tell other customers what you think about the digital product…" />
                <div className="text-xs text-muted-foreground text-right mt-1">{comment.length}/1000</div>
              </div>
              {message?.type === "error" && <p className="text-sm text-destructive">{message.text}</p>}
              {!user && <p className="text-sm text-muted-foreground">Please sign in to submit a review.</p>}
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {user ? "Submit review" : "Sign in to review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {message?.type === "success" && !showForm && <p className="text-sm text-primary mb-6">{message.text}</p>}

      {!localReviews.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No reviews yet. Be the first to review this product.</CardContent></Card>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1 flex flex-col items-center justify-center text-center bg-muted/40 rounded-xl p-6">
              <span className="text-5xl font-bold text-foreground">{avg.toFixed(1)}</span>
              <StarRow rating={avg} size="h-5 w-5" />
              <span className="text-sm text-muted-foreground mt-2">Based on {count} {count === 1 ? "review" : "reviews"}</span>
            </div>
            <div className="md:col-span-2 flex flex-col justify-center gap-1.5">
              {[5, 4, 3, 2, 1].map((star, i) => (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-muted-foreground shrink-0">{star} star</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${breakdown[i]}%` }} /></div>
                  <span className="w-10 text-right text-muted-foreground shrink-0">{breakdown[i]}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {visibleReviews.map((review, i) => (
              <Card key={review._id ?? `${review.reviewerName}-${review.createdAt ?? i}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(review.reviewerName)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2"><span className="font-medium text-foreground truncate">{review.reviewerName}</span><span className="text-xs text-muted-foreground shrink-0">{formatDate(review.createdAt)}</span></div>
                      <div className="flex items-center gap-2 mt-1 mb-2"><StarRow rating={review.rating} />{review.verifiedPurchase && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><BadgeCheck className="h-3.5 w-3.5 text-primary" />Verified purchase</span>}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {hasMore && <div className="flex justify-center mt-6"><Button variant="outline" onClick={() => setVisibleCount((c) => c + SHOW_MORE_STEP)}>Show more reviews<ChevronDown className="h-4 w-4 ml-2" /></Button></div>}
        </>
      )}
    </section>
  );
}
