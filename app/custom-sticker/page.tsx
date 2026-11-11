"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const UNIT_PRICE = 4.5;

export default function CustomStickerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState("8");
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const total = useMemo(() => UNIT_PRICE * quantity, [quantity]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    const subject = encodeURIComponent("Custom sticker quote request");
    const body = encodeURIComponent(
      `Email: ${email}\nArtwork filename: ${file.name}\nSize: ${size} cm\nQuantity: ${quantity}\nEstimated total: $${total.toFixed(2)}\nNotes: ${notes}\n\nPlease reply with upload instructions for my artwork.`
    );
    window.location.assign(`https://mail.google.com/mail/?view=cm&fs=1&to=support%40fabricnow.pro&su=${subject}&body=${body}`);
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/stickers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to stickers</Link>
      <div className="mt-7 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Made to order</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Your artwork. Your sticker.</h1>
        <p className="mt-3 text-muted-foreground">Tell us the size and quantity you need. We’ll confirm print readiness, production details and the final quote before payment.</p>
      </div>
      <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card><CardContent className="space-y-5 p-6">
          <div>
            <label htmlFor="artwork" className="mb-2 block text-sm font-semibold">Artwork file</label>
            <label htmlFor="artwork" className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center hover:bg-muted/60">
              <UploadCloud className="h-8 w-8 text-primary" />
              <span className="mt-3 text-sm font-semibold">{file ? file.name : "Choose PNG, JPG, SVG or PDF"}</span>
              <span className="mt-1 text-xs text-muted-foreground">Maximum file size: 15 MB</span>
              <input id="artwork" type="file" accept=".png,.jpg,.jpeg,.svg,.pdf" required className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            {file && file.size > 15 * 1024 * 1024 && <p className="mt-2 text-sm text-destructive">Please choose a file smaller than 15 MB.</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="size" className="mb-2 block text-sm font-semibold">Sticker width</label><select id="size" value={size} onChange={(e) => setSize(e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3"><option value="5">5 cm</option><option value="8">8 cm</option><option value="10">10 cm</option><option value="15">15 cm</option></select></div>
            <div><label htmlFor="quantity" className="mb-2 block text-sm font-semibold">Quantity</label><input id="quantity" type="number" min="10" max="1000" step="1" value={quantity} onChange={(e) => setQuantity(Math.max(10, Math.min(1000, Number(e.target.value) || 10)))} className="h-11 w-full rounded-lg border border-input bg-background px-3" /></div>
          </div>
          <div><label htmlFor="email" className="mb-2 block text-sm font-semibold">Your email</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 w-full rounded-lg border border-input bg-background px-3" /></div>
          <div><label htmlFor="notes" className="mb-2 block text-sm font-semibold">Notes (optional)</label><textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Tell us about the finish, cutline or intended use..." className="w-full rounded-lg border border-input bg-background p-3" /></div>
        </CardContent></Card>
        <aside className="h-fit rounded-2xl border border-border bg-muted/30 p-5">
          <h2 className="font-semibold">Estimated price</h2>
          <p className="mt-4 text-3xl font-bold tabular-nums">${total.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Planning estimate at $4.50 per sticker. Final pricing depends on size, material and artwork preparation.</p>
          <div className="my-5 border-t border-border" />
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Quantity</span><span>{quantity}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted-foreground">Width</span><span>{size} cm</span></div>
          <Button type="submit" className="mt-6 w-full" disabled={!file || file.size > 15 * 1024 * 1024}>Request my quote</Button>
          <p className="mt-3 text-xs text-muted-foreground">This opens your email app with the request details. Artwork is not uploaded automatically.</p>
        </aside>
      </form>
    </main>
  );
}
