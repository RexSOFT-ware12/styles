"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UpgradeGate } from "@/components/account/UpgradeGate";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useEntitlement } from "@/lib/useEntitlement";
import { downloadSvg, traceImageToSvgWithProgress } from "@/lib/svgPreview";
import { customizeSvg, SvgCustomizeOptions, UpgradeRequiredError } from "@/lib/svgCustomize";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  RotateCcw,
  ScanLine,
  Sliders,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Status = "idle" | "processing" | "success" | "error";

const STAGES = [
  { label: "Uploading artwork", icon: UploadCloud },
  { label: "Reading pixels", icon: ScanLine },
  { label: "Tracing vector paths", icon: Wand2 },
  { label: "Finishing SVG", icon: Sparkles },
] as const;

const ACCEPTED_HINT = ".png, .jpg, or .webp";
const MAX_LABEL_CHARS = 34;

const DEFAULT_CUSTOM_OPTIONS: SvgCustomizeOptions = {
  steps: 5,
  threshold: 200,
  turdSize: 2,
  optTolerance: 0.3,
  color: "#000000",
  background: "transparent",
};

function isAcceptedFile(file: File) {
  return /image\/(png|jpe?g|webp)/.test(file.type);
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

/**
 * The Design Patterns page's headline feature: a live, public demo of the
 * same potrace-based PNG -> SVG tracer that powers the admin "Add Design
 * Pattern" flow (style-backend/src/lib/svgConvert.js). Nothing uploaded here
 * is saved — it's a "try before you browse" moment sitting above the
 * purchasable pattern grid.
 *
 * Deliberately mirrors the Garment Tool page's stage-by-stage progress
 * animation (account/garment-tool/page.tsx) — same stitch-run progress bar,
 * same pop-in success beat — so the two "upload something, watch it get
 * processed" moments on the site feel like one consistent, polished product.
 */
export default function SvgTraceTool() {
  const { user, token } = useAuth();
  const { entitlement, loading: entitlementLoading } = useEntitlement(token);

  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  // --- Premium SVG customization (gated: 3-day trial, then $19.99/mo) ---
  const [showCustomize, setShowCustomize] = useState(false);
  const [customOptions, setCustomOptions] = useState<SvgCustomizeOptions>(DEFAULT_CUSTOM_OPTIONS);
  const [customizing, setCustomizing] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [customSvg, setCustomSvg] = useState<string | null>(null);

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
    if (stageIndex === 0) return Math.round(uploadPercent * 0.22);
    if (stageIndex === 1) return 45;
    if (stageIndex === 2) return 72;
    return 90;
  }, [stageIndex, uploadPercent, status]);

  function pickFile(candidate: File) {
    if (!isAcceptedFile(candidate)) {
      setError(`"${candidate.name}" isn't a supported image — use ${ACCEPTED_HINT}.`);
      setStatus("error");
      return;
    }
    setError(null);
    setStatus("idle");
    setSvg(null);
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
    setSvg(null);
    setError(null);
    setStageIndex(0);
    setUploadPercent(0);
    setShowCustomize(false);
    setCustomSvg(null);
    setCustomError(null);
    setNeedsUpgrade(false);
    setCustomOptions(DEFAULT_CUSTOM_OPTIONS);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus("processing");
    setError(null);
    setStageIndex(0);
    setUploadPercent(0);

    // The backend traces and responds in one shot with no progress events
    // of its own, so stages 2-4 advance on a plausible fixed timeline while
    // we wait — capped below 100 until the request actually resolves.
    const advance = (index: number, delay: number) => {
      timers.current.push(setTimeout(() => setStageIndex(index), delay));
    };

    try {
      const result = await traceImageToSvgWithProgress(file, (pct) => {
        setUploadPercent(pct);
        if (pct >= 100) {
          advance(1, 150);
          advance(2, 900);
          advance(3, 1900);
        }
      });

      clearTimers();
      setStageIndex(3);
      setSvg(result.svg);
      setTimeout(() => setStatus("success"), 250);
    } catch (err) {
      clearTimers();
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  async function handleCustomize() {
    if (!file || !token) return;
    setCustomizing(true);
    setCustomError(null);
    setNeedsUpgrade(false);
    try {
      const result = await customizeSvg(token, file, customOptions);
      setCustomSvg(result.svg);
    } catch (err) {
      if (err instanceof UpgradeRequiredError) {
        setNeedsUpgrade(true);
      } else {
        setCustomError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setCustomizing(false);
    }
  }

  return (
    <section className="mx-auto mb-16 max-w-5xl">
      <Card
        className={cn(
          "overflow-hidden motion-safe:animate-[rise-in_0.4s_ease-out]",
          status === "error" && "border-destructive/40"
        )}
      >
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            {/* Left: the actual tool */}
            <div className="p-6 sm:p-8">
              <Badge variant="secondary" className="mb-3 gap-1.5">
                <Sparkles className="h-3 w-3" /> Try it live
              </Badge>
              <h2 className="text-primary text-xl font-semibold tracking-tight mb-1.5">
                See your artwork as clean vector SVG
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Drop in a logo, icon, or flat-color pattern swatch and watch it get traced into a
                scalable SVG in seconds — nothing is saved or added to the shop.
              </p>

              {status === "success" && svg ? (
                <div className="flex flex-col items-center text-center py-2">
                  <div className="motion-safe:animate-[pop-in_0.4s_ease-out] rounded-full bg-emerald-50 p-3 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Traced</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mb-6">
                    Your SVG is ready on the right — download it, or trace another image.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => svg && downloadSvg(svg, `${(file?.name || "pattern").replace(/\.[^.]+$/, "")}.svg`)}
                    >
                      <Download className="h-4 w-4 mr-1.5" /> Download SVG
                    </Button>
                    <Button onClick={reset}>
                      <RotateCcw className="h-4 w-4 mr-1.5" /> Trace another
                    </Button>
                  </div>

                  <div className="mt-6 w-full border-t pt-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => setShowCustomize((v) => !v)}
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      {showCustomize ? "Hide customization" : "Customize this trace"}
                      <Badge variant="secondary" className="ml-1 gap-1 text-[10px]">
                        <Sparkles className="h-2.5 w-2.5" /> Premium
                      </Badge>
                    </Button>

                    {showCustomize && (
                      <div className="mt-4 text-left">
                        {!user ? (
                          <div className="rounded-lg border border-dashed p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-3">
                              Sign in to fine-tune the trace — detail level, colors, and background.
                            </p>
                            <Button asChild size="sm">
                              <Link href="/signin?redirect=/design-patterns">Sign in</Link>
                            </Button>
                          </div>
                        ) : entitlementLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : needsUpgrade || (entitlement && !entitlement.hasAccess) ? (
                          <UpgradeGate featureName="SVG customization" />
                        ) : (
                          <div className="space-y-4 rounded-lg border p-4">
                            {entitlement?.trialActive && entitlement.plan === "free" && (
                              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                                {entitlement.trialDaysLeft} day{entitlement.trialDaysLeft === 1 ? "" : "s"} left
                                in your free trial.
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <label className="text-xs font-medium text-muted-foreground">
                                Detail level ({customOptions.steps})
                                <input
                                  type="range"
                                  min={1}
                                  max={16}
                                  value={customOptions.steps}
                                  onChange={(e) =>
                                    setCustomOptions((o) => ({ ...o, steps: Number(e.target.value) }))
                                  }
                                  className="mt-1.5 w-full accent-primary"
                                />
                              </label>
                              <label className="text-xs font-medium text-muted-foreground">
                                Threshold ({customOptions.threshold})
                                <input
                                  type="range"
                                  min={0}
                                  max={255}
                                  value={customOptions.threshold}
                                  onChange={(e) =>
                                    setCustomOptions((o) => ({ ...o, threshold: Number(e.target.value) }))
                                  }
                                  className="mt-1.5 w-full accent-primary"
                                />
                              </label>
                              <label className="text-xs font-medium text-muted-foreground">
                                Fill color
                                <input
                                  type="color"
                                  value={customOptions.color}
                                  onChange={(e) => setCustomOptions((o) => ({ ...o, color: e.target.value }))}
                                  className="mt-1.5 h-8 w-full rounded-md border cursor-pointer"
                                />
                              </label>
                              <label className="text-xs font-medium text-muted-foreground">
                                Background
                                <select
                                  value={customOptions.background === "transparent" ? "transparent" : "white"}
                                  onChange={(e) =>
                                    setCustomOptions((o) => ({
                                      ...o,
                                      background: e.target.value === "transparent" ? "transparent" : "#ffffff",
                                    }))
                                  }
                                  className="mt-1.5 w-full rounded-md border px-2 py-1.5 text-sm"
                                >
                                  <option value="transparent">Transparent</option>
                                  <option value="white">White</option>
                                </select>
                              </label>
                            </div>

                            {customError && (
                              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                <p className="text-sm text-destructive">{customError}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" onClick={handleCustomize} disabled={customizing}>
                                {customizing ? (
                                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                ) : (
                                  <Wand2 className="h-4 w-4 mr-1.5" />
                                )}
                                Apply customization
                              </Button>
                              {customSvg && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    downloadSvg(
                                      customSvg,
                                      `${(file?.name || "pattern").replace(/\.[^.]+$/, "")}-custom.svg`
                                    )
                                  }
                                >
                                  <Download className="h-4 w-4 mr-1.5" /> Download custom SVG
                                </Button>
                              )}
                            </div>

                            {customSvg && (
                              <div
                                className="mt-2 aspect-square w-full max-w-[200px] rounded-lg border bg-white p-3 [&_svg]:h-full [&_svg]:w-full"
                                dangerouslySetInnerHTML={{ __html: customSvg }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
                        (document.getElementById("svg-trace-file-input") as HTMLInputElement)?.click()
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          (
                            document.getElementById("svg-trace-file-input") as HTMLInputElement
                          )?.click();
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center cursor-pointer overflow-hidden transition-colors",
                        isDragging
                          ? "border-primary bg-accent/40"
                          : "border-border hover:border-primary/50 hover:bg-muted/40"
                      )}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-60 motion-safe:animate-[shimmer-sweep_3.5s_ease-in-out_infinite]"
                        style={{
                          backgroundImage:
                            "linear-gradient(100deg, transparent 30%, color-mix(in oklch, var(--primary) 12%, transparent) 45%, transparent 60%)",
                          backgroundSize: "200% 100%",
                        }}
                      />
                      <div className="relative rounded-full bg-accent p-3">
                        <UploadCloud className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div className="relative">
                        <p className="text-sm font-medium">Drop an image here, or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">{ACCEPTED_HINT}</p>
                      </div>
                      <input
                        id="svg-trace-file-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
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
                        <img
                          src={previewUrl}
                          alt=""
                          className="h-12 w-12 rounded-md object-cover border"
                        />
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
                    <Wand2 className="h-4 w-4 mr-1.5" /> Trace to SVG
                  </Button>
                </form>
              )}
            </div>

            {/* Right: live result, or a decorative idle illustration */}
            <div className="relative flex items-center justify-center border-t md:border-t-0 md:border-l bg-muted/30 p-6 sm:p-8 min-h-[240px]">
              {status === "success" && svg ? (
                <div
                  className="motion-safe:animate-[pop-in_0.35s_ease-out] w-full max-w-[220px] aspect-square rounded-lg border bg-white p-4 shadow-sm [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <IdleTraceIllustration active={status === "processing"} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/** A dashed square that continuously "draws" itself, hinting at what the
 *  tracer does before the visitor has uploaded anything — speeds up subtly
 *  while a real trace is in progress. */
function IdleTraceIllustration({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 sm:w-48 sm:h-48" aria-hidden>
      <rect
        x="30"
        y="30"
        width="140"
        height="140"
        rx="16"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="12 10"
        strokeDashoffset="880"
        className={cn(
          "motion-safe:animate-[trace-draw_6s_linear_infinite]",
          active && "motion-safe:[animation-duration:1.4s]"
        )}
        opacity="0.55"
      />
      <path
        d="M55 130 L85 90 L110 115 L145 65"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="200"
        strokeDashoffset="200"
        className={cn(
          "motion-safe:animate-[trace-draw_3.2s_ease-in-out_infinite]",
          active && "motion-safe:[animation-duration:0.9s]"
        )}
      />
      <circle cx="145" cy="65" r="5" fill="var(--primary)" />
    </svg>
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
