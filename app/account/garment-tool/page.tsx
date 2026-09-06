"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { downloadBlob, processGarmentFileWithProgress } from "@/lib/garmentTool";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Package,
  PenTool,
  RotateCcw,
  Scissors,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Status = "idle" | "processing" | "success" | "error";

const STAGES = [
  { label: "Uploading file", icon: UploadCloud },
  { label: "Removing background", icon: Wand2 },
  { label: "Tracing garment parts", icon: PenTool },
  { label: "Packaging files", icon: Package },
] as const;

const ACCEPTED_HINT = ".psd, .png, .jpg, .webp";
const MAX_LABEL_CHARS = 34;

function isAcceptedFile(file: File) {
  return file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".psd");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function truncateName(name: string) {
  if (name.length <= MAX_LABEL_CHARS) return name;
  const dot = name.lastIndexOf(".");
  const ext = dot > -1 ? name.slice(dot) : "";
  return `${name.slice(0, MAX_LABEL_CHARS - ext.length - 1)}…${ext}`;
}

export default function GarmentToolPage() {
  const { user, token, loading: authLoading } = useAuth();

  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const overallPercent = useMemo(() => {
    if (status === "success") return 100;
    if (stageIndex === 0) return Math.round(uploadPercent * 0.22);
    if (stageIndex === 1) return 40;
    if (stageIndex === 2) return 66;
    return 88;
  }, [stageIndex, uploadPercent, status]);

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

  function pickFile(candidate: File) {
    if (!isAcceptedFile(candidate)) {
      setError(`"${candidate.name}" isn't a supported file — use ${ACCEPTED_HINT}.`);
      setStatus("error");
      return;
    }
    setError(null);
    setStatus("idle");
    setFile(candidate);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) pickFile(dropped);
  }

  function reset() {
    clearTimers();
    setStatus("idle");
    setFile(null);
    setResultBlob(null);
    setError(null);
    setStageIndex(0);
    setUploadPercent(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !token) return;

    setStatus("processing");
    setError(null);
    setStageIndex(0);
    setUploadPercent(0);

    // The backend returns a single response with no progress events of its
    // own, so stages 2–4 advance on a plausible fixed timeline while we
    // wait — capped below 100 until the request actually resolves, never
    // claiming completion early.
    const advance = (index: number, delay: number) => {
      timers.current.push(setTimeout(() => setStageIndex(index), delay));
    };

    try {
      const blob = await processGarmentFileWithProgress(token, file, (pct) => {
        setUploadPercent(pct);
        if (pct >= 100) {
          advance(1, 150);
          advance(2, 1500);
          advance(3, 3200);
        }
      });

      clearTimers();
      setStageIndex(3);
      setResultBlob(blob);
      downloadBlob(blob, "garment-processed.zip");
      setTimeout(() => setStatus("success"), 250);
    } catch (err) {
      clearTimers();
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <h1 className="text-primary text-3xl font-semibold tracking-tight mb-2">Garment Tool</h1>
      <p className="text-muted-foreground mb-8 max-w-lg">
        Upload a design .psd (or a plain photo) and get back a background-removed image plus a
        rough first-pass vector outline for each detected garment part — a head start, not a
        finished result.
      </p>

      <Card
        className={cn(
          "motion-safe:animate-[rise-in_0.4s_ease-out]",
          status === "error" && "border-destructive/40"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scissors className="h-5 w-5" /> Process a file
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="motion-safe:animate-[pop-in_0.4s_ease-out] rounded-full bg-emerald-50 p-3 mb-4">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold mb-1">All done</h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Your download should have started automatically — a background-removed PNG, plus
                any detected garment-part traces the tool could pick out.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => resultBlob && downloadBlob(resultBlob, "garment-processed.zip")}
                >
                  <Download className="h-4 w-4 mr-1.5" /> Download again
                </Button>
                <Button onClick={reset}>
                  <RotateCcw className="h-4 w-4 mr-1.5" /> Process another file
                </Button>
              </div>
            </div>
          ) : status === "processing" ? (
            <div className="py-4">
              <ProgressTrack stageIndex={stageIndex} percent={overallPercent} />
              <p className="text-xs text-muted-foreground text-center mt-4">
                {truncateName(file?.name ?? "")}
                {stageIndex === 0 && ` — ${uploadPercent}% uploaded`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!file ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    (document.getElementById("garment-file-input") as HTMLInputElement)?.click()
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      (document.getElementById("garment-file-input") as HTMLInputElement)?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors",
                    isDragging
                      ? "border-primary bg-accent/40"
                      : "border-border hover:border-primary/50 hover:bg-muted/40"
                  )}
                >
                  <div className="rounded-full bg-accent p-3">
                    <Scissors className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drop a file here, or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">{ACCEPTED_HINT}</p>
                  </div>
                  <input
                    id="garment-file-input"
                    type="file"
                    accept=".psd,image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const picked = e.target.files?.[0];
                      if (picked) pickFile(picked);
                      e.target.value = "";
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center">
                      <Badge variant="secondary" className="text-[10px]">
                        PSD
                      </Badge>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="Remove file"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {status === "error" && error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={!file} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-1.5" /> Process &amp; download
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressTrack({ stageIndex, percent }: { stageIndex: number; percent: number }) {
  return (
    <div>
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out motion-safe:animate-[stitch-run_0.6s_linear_infinite]"
          style={{
            width: `${percent}%`,
            backgroundImage:
              "repeating-linear-gradient(to right, color-mix(in oklch, var(--primary-foreground) 35%, transparent) 0 3px, transparent 3px 7px)",
          }}
        />
      </div>

      <ol className="mt-5 grid grid-cols-4 gap-2">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const state = i < stageIndex ? "done" : i === stageIndex ? "active" : "upcoming";
          return (
            <li key={stage.label} className="flex flex-col items-center text-center gap-1.5">
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                  state === "done" && "bg-primary border-primary text-primary-foreground",
                  state === "active" && "border-primary text-primary",
                  state === "upcoming" && "border-border text-muted-foreground"
                )}
              >
                {state === "active" && (
                  <span className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-ping" />
                )}
                {state === "done" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] leading-tight",
                  state === "upcoming" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
