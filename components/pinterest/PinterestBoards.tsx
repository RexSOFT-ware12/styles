"use client";

import PinterestIcon from "@/components/pinterest/PinterestIcon";
import { Button } from "@/components/ui/button";
import { CONSENT_EVENT, getCookieConsent } from "@/lib/cookieConsent";
import type { PinterestBoard } from "@/lib/pinterest";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    PinUtils?: { build: () => void };
  }
}

const SCRIPT_SRC = "https://assets.pinterest.com/js/pinit.js";

function loadPinit(): Promise<void> {
  return new Promise((resolve) => {
    if (window.PinUtils) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const s = existing || document.createElement("script");
    s.addEventListener("load", () => resolve(), { once: true });
    if (!existing) {
      s.async = true;
      s.src = SCRIPT_SRC;
      document.body.appendChild(s);
    }
  });
}

/**
 * Embeds the boards set in Admin → Pinterest. Pinterest's widget can set its
 * own cookies, so it loads straight away only for visitors who pressed
 * "Accept all"; everyone else sees a button to load it.
 */
export default function PinterestBoards({ boards }: { boards: PinterestBoard[] }) {
  const [enabled, setEnabled] = useState(false);
  const [width, setWidth] = useState(360);

  useEffect(() => {
    const check = () => getCookieConsent() === "accepted" && setEnabled(true);
    check();
    window.addEventListener(CONSENT_EVENT, check);
    const fit = () => setWidth(Math.min(400, Math.max(260, window.innerWidth - 48)));
    fit();
    window.addEventListener("resize", fit);
    return () => {
      window.removeEventListener(CONSENT_EVENT, check);
      window.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loadPinit().then(() => {
      if (live) window.PinUtils?.build();
    });
    return () => {
      live = false;
    };
  }, [enabled, width]);

  if (!boards.length) return null;

  return (
    <div>
      {!enabled && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
          <PinterestIcon className="h-6 w-6 shrink-0 text-[#E60023]" />
          <p className="flex-1 text-sm text-muted-foreground">
            Our boards are shown by Pinterest, which may set its own cookies. Load them here, or open each board on Pinterest.
          </p>
          <Button size="sm" onClick={() => setEnabled(true)} className="bg-[#E60023] text-white hover:bg-[#ad081b]">
            Show boards
          </Button>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {boards.map((b) => (
          <div key={b.url} className="overflow-hidden rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">{b.title}</h3>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-[#E60023]"
              >
                Open on Pinterest <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {enabled ? (
              <div className="flex justify-center overflow-hidden" key={`${b.url}-${width}`}>
                <a
                  data-pin-do="embedBoard"
                  data-pin-board-width={String(width)}
                  data-pin-scale-height="320"
                  data-pin-scale-width="80"
                  href={b.url}
                >
                  {b.title}
                </a>
              </div>
            ) : (
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-40 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground hover:text-[#E60023]"
              >
                <PinterestIcon className="mr-2 h-5 w-5 text-[#E60023]" />
                View “{b.title}”
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
