"use client";

import { cn } from "@/lib/utils";
import type { PoseAngle } from "@/lib/poseTool";
import { Move3D } from "lucide-react";
import { useRef, useState } from "react";

const ORDER: PoseAngle[] = ["front", "side", "back"];
const LABELS: Record<PoseAngle, string> = { front: "Front", side: "Side", back: "Back" };

// Pixels of horizontal drag needed to advance one step. Deliberately coarse
// (not a true continuous 3D rotation — there are only 3 generated angles),
// so this reads as "step through views" rather than promising smoothness
// it can't deliver.
const DRAG_STEP_PX = 90;

export function PoseTurntable({
  images,
  warnings,
}: {
  images: Record<PoseAngle, string | null>;
  warnings?: Partial<Record<PoseAngle, string | null>>;
}) {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);
  const hasAnyImage = ORDER.some((a) => images[a]);

  function stepTo(next: number) {
    setIndex(((next % ORDER.length) + ORDER.length) % ORDER.length);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartIndex.current = index;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    const steps = Math.round(delta / DRAG_STEP_PX);
    stepTo(dragStartIndex.current - steps);
  }

  function endDrag() {
    setIsDragging(false);
  }

  if (!hasAnyImage) {
    const anyWarning = warnings && ORDER.map((a) => warnings[a]).find(Boolean);
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        <Move3D className="h-6 w-6" />
        {anyWarning || "No reference images were generated for this pose."}
      </div>
    );
  }

  const angle = ORDER[index];
  const src = images[angle];

  return (
    <div className="select-none">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className={cn(
          "relative mx-auto flex h-72 w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border bg-muted/40 touch-none",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`${LABELS[angle]} pose reference`}
            draggable={false}
            className="h-full w-full object-contain motion-safe:animate-[pop-in_0.25s_ease-out]"
          />
        ) : (
          <p className="px-6 text-center text-xs text-muted-foreground">
            {(warnings && warnings[angle]) ||
              `The ${LABELS[angle].toLowerCase()} view couldn't be generated for this pose.`}
          </p>
        )}

        <div
          className={cn(
            "pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm",
            !isDragging && "motion-safe:animate-[drag-hint_1.6s_ease-in-out_infinite]"
          )}
        >
          <Move3D className="h-3 w-3" /> Drag to rotate
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {ORDER.map((a, i) => (
          <button
            key={a}
            type="button"
            onClick={() => stepTo(i)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              i === index
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {LABELS[a]}
          </button>
        ))}
      </div>
    </div>
  );
}
