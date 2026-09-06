// The premium sibling of lib/svgPreview.ts — calls the authenticated,
// gated endpoint (style-backend/src/routes/svgCustomize.js) that lets a
// signed-in, entitled user tune the trace instead of getting the fixed
// public defaults.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface SvgCustomizeOptions {
  steps: number;
  threshold: number;
  turdSize: number;
  optTolerance: number;
  color: string;
  background: string; // "transparent" or a hex color
}

export interface SvgCustomizeResult {
  svg: string;
  options: SvgCustomizeOptions;
}

/** Thrown for a 402 response so callers can tell "needs upgrade" apart from any other failure. */
export class UpgradeRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpgradeRequiredError";
  }
}

export async function customizeSvg(
  token: string,
  file: File,
  options: SvgCustomizeOptions
): Promise<SvgCustomizeResult> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("steps", String(options.steps));
  formData.append("threshold", String(options.threshold));
  formData.append("turdSize", String(options.turdSize));
  formData.append("optTolerance", String(options.optTolerance));
  formData.append("color", options.color);
  formData.append("background", options.background);

  const res = await fetch(`${API_BASE}/svg-customize/process`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let message = `Request failed with ${res.status}`;
    let code: string | undefined;
    try {
      const json = await res.json();
      message = json.error || message;
      code = json.code;
    } catch {
      // ignore — keep the generic message
    }
    if (res.status === 402 || code === "UPGRADE_REQUIRED") {
      throw new UpgradeRequiredError(message);
    }
    throw new Error(message);
  }

  return res.json();
}
