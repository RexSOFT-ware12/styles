"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PoseTurntable } from "@/components/account/PoseTurntable";
import { TrialBanner, UpgradeGate } from "@/components/account/UpgradeGate";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useEntitlement } from "@/lib/useEntitlement";
import {
  type PoseResult,
  downloadBlob,
  poseZipToBlob,
  processPoseFileWithProgress,
} from "@/lib/poseTool";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  PersonStanding,
  RotateCcw,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Status = "idle" | "processing" | "success" | "error";

const STAGES = [
  { label: "Uploading photo", icon: UploadCloud },
  { label: "Reading the pose", icon: Sparkles },
  { label: "Generating turnaround", icon: Wand2 },
] as const;

const ACCEPTED_HINT = ".png, .jpg, .webp";
const MAX_LABEL_CHARS = 34;

function isAcceptedFile(file: File) {
  return file.type.startsWith("image/");
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

export default function PoseToolPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { entitlement, loading: entitlementLoading } = useEntitlement(token);

  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PoseResult | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const overallPercent = useMemo(() => {
    if (status === "success") return 100;
    if (stageIndex === 0) return Math.round(uploadPercent * 0.3);
    if (stageIndex === 1) return 55;
    return 85;
  }, [stageIndex, uploadPercent, status]);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to use the Pose Tool</h1>
        <Button asChild className="mt-4">
          <Link href="/signin?redirect=/account/pose-tool">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!entitlementLoading && entitlement && !entitlement.hasAccess) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        <h1 className="text-primary text-3xl font-semibold tracking-tight mb-6">Pose Tool</h1>
        <UpgradeGate featureName="The Pose Tool" />
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
    setResult(null);
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
    // own once the upload finishes, so the remaining stages advance on a
    // plausible fixed timeline while we wait for Gemini — capped below
    // 100 until the request actually resolves.
    const advance = (index: number, delay: number) => {
      timers.current.push(setTimeout(() => setStageIndex(index), delay));
    };

    try {
      const data = await processPoseFileWithProgress(token, file, (pct) => {
        setUploadPercent(pct);
        if (pct >= 100) {
          advance(1, 150);
          advance(2, 2500);
        }
      });

      clearTimers();
      setStageIndex(2);
      setResult(data);
      setTimeout(() => setStatus("success"), 250);
    } catch (err) {
      clearTimers();
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function downloadZip() {
    if (!result) return;
    downloadBlob(poseZipToBlob(result.zipBase64), "pose-reference.zip");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <h1 className="text-primary text-3xl font-semibold tracking-tight mb-2">Pose Tool</h1>
      {entitlement?.trialActive && entitlement.plan === "free" && (
        <TrialBanner daysLeft={entitlement.trialDaysLeft} />
      )}
      <p className="text-muted-foreground mb-8 max-w-lg">
        Upload a reference photo and Gemini reads the pose, then generates a neutral front/side/back
        mannequin turnaround plus notes written for CLO3D&apos;s Avatar Pose editor — a fast starting
        point, not measured joint data.
      </p>

      <Card
        className={cn(
          "motion-safe:animate-[rise-in_0.4s_ease-out]",
          status === "error" && "border-destructive/40"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PersonStanding className="h-5 w-5" /> Analyze a pose
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "success" && result ? (
            <div className="flex flex-col items-center text-center py-2">
              <div className="motion-safe:animate-[pop-in_0.4s_ease-out] rounded-full bg-emerald-50 p-3 mb-4">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold mb-4">Pose read</h2>

              <PoseTurntable images={result.images} warnings={result.imageWarnings} />

              <div className="mt-6 w-full space-y-4 text-left">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Summary</h3>
                  <p className="text-sm text-muted-foreground">{result.pose.summary}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium">Stance</p>
                    <p className="text-muted-foreground">{result.pose.stance}</p>
                  </div>
                  <div>
                    <p className="font-medium">Weight distribution</p>
                    <p className="text-muted-foreground">{result.pose.weightDistribution}</p>
                  </div>
                  <div>
                    <p className="font-medium">Left arm</p>
                    <p className="text-muted-foreground">{result.pose.regions?.leftArm}</p>
                  </div>
                  <div>
                    <p className="font-medium">Right arm</p>
                    <p className="text-muted-foreground">{result.pose.regions?.rightArm}</p>
                  </div>
                  <div>
                    <p className="font-medium">Left leg</p>
                    <p className="text-muted-foreground">{result.pose.regions?.leftLeg}</p>
                  </div>
                  <div>
                    <p className="font-medium">Right leg</p>
                    <p className="text-muted-foreground">{result.pose.regions?.rightLeg}</p>
                  </div>
                </div>
                {result.pose.clo3dTips && result.pose.clo3dTips.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">CLO3D tips</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-0.5">
                      {result.pose.clo3dTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={downloadZip}>
                  <Download className="h-4 w-4 mr-1.5" /> Download bundle
                </Button>
                <Button onClick={reset}>
                  <RotateCcw className="h-4 w-4 mr-1.5" /> Analyze another photo
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
                  onClick={() => (document.getElementById("pose-file-input") as HTMLInputElement)?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      (document.getElementById("pose-file-input") as HTMLInputElement)?.click();
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
                    <PersonStanding className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drop a reference photo here, or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">{ACCEPTED_HINT}</p>
                  </div>
                  <input
                    id="pose-file-input"
                    type="file"
                    accept="image/*"
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
                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="" className="h-12 w-12 rounded-md object-cover border" />
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
                <Sparkles className="h-4 w-4 mr-1.5" /> Analyze pose
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

      <ol className="mt-5 grid grid-cols-3 gap-2">
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
                {state === "done" ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
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
