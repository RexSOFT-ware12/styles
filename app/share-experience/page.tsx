"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { sendTestimonial } from "@/lib/store";
import { CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ShareExperiencePage() {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", role: "", quote: "" });
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    setBusy(true);
    setError(null);
    try {
      await sendTestimonial(
        { ...form, name: form.name || user?.name || "", email: form.email || user?.email || "", rating },
        token
      );
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your feedback.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h1 className="mb-2 text-2xl font-bold">Thank you!</h1>
        <p className="mb-6 text-muted-foreground">Your feedback will appear on our homepage once our team has reviewed it.</p>
        <Button asChild><Link href="/">Back to FabricNow</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Badge className="mb-4">Your experience</Badge>
      <h1 className="mb-2 text-3xl font-bold text-foreground">How is FabricNow working for you?</h1>
      <p className="mb-8 text-muted-foreground">Share an honest review. With your permission we may show it on our homepage — we only publish what customers actually write.</p>
      <form onSubmit={submit} className="space-y-4">
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Rating</legend>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)} className="rounded p-1">
                <Star className={`h-8 w-8 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Your name
            <Input className="mt-1" required value={form.name || user?.name || ""} onChange={set("name")} maxLength={80} />
          </label>
          <label className="block text-sm font-medium">Email (never shown)
            <Input className="mt-1" type="email" required value={form.email || user?.email || ""} onChange={set("email")} maxLength={254} />
          </label>
        </div>
        <label className="block text-sm font-medium">What do you do? (optional)
          <Input className="mt-1" placeholder="e.g. Fashion designer, Pattern maker" value={form.role} onChange={set("role")} maxLength={80} />
        </label>
        <label className="block text-sm font-medium">Your review
          <Textarea className="mt-1" required rows={5} minLength={10} maxLength={600} value={form.quote} onChange={set("quote")} />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? "Sending…" : "Submit review"}</Button>
      </form>
    </div>
  );
}
