"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { downloadBlob, processGarmentFile } from "@/lib/garmentTool";
import { Download, Loader2, Scissors } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

export default function GarmentToolPage() {
  const { user, token, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to use the Garment Tool</h1>
        <Button asChild className="mt-4">
          <Link href="/signin?redirect=/account/garment-tool">Sign in</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);

    const file = fileInputRef.current?.files?.[0];
    if (!file || !token) {
      setError("Choose a .psd or photo first.");
      return;
    }

    setProcessing(true);
    try {
      const blob = await processGarmentFile(token, file);
      downloadBlob(blob, "garment-processed.zip");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Garment Tool</h1>
      <p className="text-muted-foreground mb-8">
        Upload a design .psd (or a plain photo) and get back a background-removed image plus a rough
        first-pass vector outline for each detected garment part — a head start, not a finished result.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scissors className="h-5 w-5" /> Process a file
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".psd,image/*"
                required
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90"
              />
              {fileName && <p className="text-xs text-muted-foreground mt-1">Selected: {fileName}</p>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {done && !error && (
              <p className="text-sm text-emerald-600">Done — your download should have started.</p>
            )}

            <Button type="submit" disabled={processing} className="w-full sm:w-auto">
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1.5" /> Process &amp; download
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
