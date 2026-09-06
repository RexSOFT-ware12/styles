// The garment tool now runs as its own standalone Cloud Run service (moved
// off the main backend because @imgly/background-removal-node's native
// onnxruntime threading was crashing under App Engine standard's gVisor
// sandbox — see garment-service/README.md). It intentionally has its own
// env var rather than reusing NEXT_PUBLIC_API_URL, since that one still
// points at the main backend for everything else (auth/orders/products).
const GARMENT_TOOL_API_BASE =
  process.env.NEXT_PUBLIC_GARMENT_TOOL_API_URL || "http://localhost:8080/api";

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || `Request failed with ${res.status}`;
  } catch {
    return `Request failed with ${res.status}`;
  }
}

/**
 * Uploads a .psd or photo and returns the generated .zip as a Blob
 * (background-removed image, plus rough per-garment-part SVG traces when
 * the backend has HF_TOKEN configured). Requires a signed-in customer.
 */
export async function processGarmentFile(token: string, file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${GARMENT_TOOL_API_BASE}/garment-tool/process`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.blob();
}

/**
 * Same as processGarmentFile, but reports real upload progress via
 * XMLHttpRequest (the fetch API has no upload-progress event). Used to
 * drive the accurate first stage of the garment tool page's progress UI.
 */
export function processGarmentFileWithProgress(
  token: string,
  file: File,
  onUploadProgress: (percent: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${GARMENT_TOOL_API_BASE}/garment-tool/process`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as Blob);
        return;
      }
      try {
        const text = await (xhr.response as Blob).text();
        const json = JSON.parse(text);
        reject(new Error(json.error || `Request failed with ${xhr.status}`));
      } catch {
        reject(new Error(`Request failed with ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error — check your connection and try again."));

    xhr.send(formData);
  });
}

/** Triggers a browser download of the given blob under `filename`. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
