"use client";

import PinterestIcon from "@/components/pinterest/PinterestIcon";
import { cameFromPinterest, loadPinterestSettings } from "@/lib/pinterest";
import { Check, Copy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DISMISS_KEY = "fabricnow_pin_welcome_dismissed";

/**
 * Small banner for visitors who arrived from a pin. Shows the welcome code
 * from Admin → Pinterest while that coupon is live; without a code it just
 * says hello and points to the Inspiration page.
 */
export default function PinterestWelcome() {
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!cameFromPinterest()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch { /* storage off: still show */ }
    let live = true;
    loadPinterestSettings().then((s) => {
      if (!live) return;
      setCode(s.welcomeCode);
      setMessage(s.welcomeMessage);
      setShow(true);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(DISMISS_KEY, new Date().toISOString()); } catch { /* ignore */ }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* the code is visible anyway */ }
  };

  const text =
    message ||
    (code ? "Found us on Pinterest? Here's a welcome code for your first CLO3D file." : "Found us on Pinterest? Welcome! Every pin here is a ready-to-use CLO3D file.");

  return (
    <div role="region" aria-label="Welcome from Pinterest" className="bg-[#E60023] text-white">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-10 py-2.5 text-sm relative">
        <PinterestIcon className="h-4 w-4 shrink-0" />
        <span className="text-center">{text}</span>
        {code ? (
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-mono text-xs font-bold text-[#E60023] hover:bg-white/90"
            aria-label={`Copy code ${code}`}
          >
            {code}
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <Link href="/inspiration" className="font-semibold underline underline-offset-2">
            See the looks
          </Link>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/15"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
