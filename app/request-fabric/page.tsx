"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { sendFabricRequest } from "@/lib/store";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function RequestFabricPage() {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", fabricType: "", description: "", referenceUrl: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendFabricRequest(
        { ...form, name: form.name || user?.name || "", email: form.email || user?.email || "" },
        token
      );
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your request.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h1 className="mb-2 text-2xl font-bold">Request received</h1>
        <p className="mb-6 text-muted-foreground">Thanks! We read every request and use them to decide which fabrics to make next. We&apos;ll email you if we add it.</p>
        <Button asChild><Link href="/shop">Back to the shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Badge className="mb-4">Fabric request</Badge>
      <h1 className="mb-2 text-3xl font-bold text-foreground">Can&apos;t find the fabric you need?</h1>
      <p className="mb-8 text-muted-foreground">Tell us what to make next. The more detail you give, the better — fibre, weave, weight, colour, or a link to an example.</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Your name
            <Input className="mt-1" required value={form.name || user?.name || ""} onChange={set("name")} maxLength={120} />
          </label>
          <label className="block text-sm font-medium">Email
            <Input className="mt-1" type="email" required value={form.email || user?.email || ""} onChange={set("email")} maxLength={254} />
          </label>
        </div>
        <label className="block text-sm font-medium">Type of fabric
          <Input className="mt-1" placeholder="e.g. Kente-style woven, heavy denim, sequin mesh" value={form.fabricType} onChange={set("fabricType")} maxLength={120} />
        </label>
        <label className="block text-sm font-medium">What do you need?
          <Textarea className="mt-1" required rows={6} minLength={10} maxLength={3000} placeholder="Describe the look, weight, drape, colours…" value={form.description} onChange={set("description")} />
        </label>
        <label className="block text-sm font-medium">Reference link (optional)
          <Input className="mt-1" type="url" placeholder="https://…" value={form.referenceUrl} onChange={set("referenceUrl")} maxLength={500} />
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? "Sending…" : "Send request"}</Button>
      </form>
    </div>
  );
}
