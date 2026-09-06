// The storefront's "try it live" PNG -> SVG tracer on /design-patterns.
// Unlike the Garment Tool (its own Cloud Run service, auth required), this
// hits the main FabricNow backend and needs no sign-in — it's a public demo
// of the same potrace-based tracer that powers the "Add Design Pattern"
// admin flow (see style-backend/src/lib/svgConvert.js).
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || `Request failed with ${res.status}`;
  } catch {
    return `Request failed with ${res.status}`;
  }
}

export interface SvgPreviewResult {
  svg: string;
}

/**
 * Uploads an image and returns the traced SVG markup as a string. Reports
 * real upload progress via XMLHttpRequest (fetch has no upload-progress
 * event) so the UI's first processing stage can track actual bytes sent
 * rather than a guess.
 */
export function traceImageToSvgWithProgress(
  file: File,
  onUploadProgress: (percent: number) => void
): Promise<SvgPreviewResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("image", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/products/design-patterns/preview`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const json = xhr.response;
        if (json?.svg) {
          resolve({ svg: json.svg as string });
        } else {
          reject(new Error("The tracer didn't return an SVG — please try again."));
        }
        return;
      }
      const json = xhr.response;
      reject(new Error(json?.error || `Request failed with ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Network error — check your connection and try again."));

    xhr.send(formData);
  });
}

/** Triggers a browser download of the traced SVG under `filename`. */
export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
