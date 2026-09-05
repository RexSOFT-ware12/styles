"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Descriptions can be a short blurb or a full multi-section markdown doc
// (headings, bullet lists, a details table). Long ones used to stretch the
// page indefinitely, so they're clamped to a fixed height with a
// "Show more" / "Show less" toggle. The clamp only kicks in — and the
// button only appears — when the rendered content actually overflows that
// height, measured after mount rather than guessed from string length.
const COLLAPSED_HEIGHT = 260; // px

export default function ProductDescription({
  description,
}: {
  description?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const checkOverflow = () =>
      setIsOverflowing(el.scrollHeight > COLLAPSED_HEIGHT + 1);

    checkOverflow();

    // Re-check on resize/font-load, since wrapping changes the height.
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [description]);

  if (!description) return null;

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? contentRef.current?.scrollHeight ?? undefined : COLLAPSED_HEIGHT,
        }}
      >
        <div
          ref={contentRef}
          className="
            text-muted-foreground leading-relaxed
            [&>*+*]:mt-4
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-2
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-2
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2
            [&_p]:leading-relaxed
            [&_strong]:text-foreground [&_strong]:font-semibold
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
            [&_hr]:border-border [&_hr]:my-6
            [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:my-2
            [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-foreground
            [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2
            [&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono [&_code]:text-foreground
          "
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {description}
          </ReactMarkdown>
        </div>

        {!expanded && isOverflowing && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      {isOverflowing && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary",
            "hover:underline underline-offset-2"
          )}
        >
          {expanded ? (
            <>
              Show less
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show more
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
