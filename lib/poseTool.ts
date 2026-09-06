// The Pose Tool calls Gemini (vision + image generation) through the main
// backend — unlike the Garment Tool, it has no heavy local ML model, so it
// runs fine on the same App Engine service as everything else and just uses
// NEXT_PUBLIC_API_URL like auth/orders/products do.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type PoseRegions = {
  headNeck?: string;
  spineTorso?: string;
  leftArm?: string;
  rightArm?: string;
  leftLeg?: string;
  rightLeg?: string;
};

export type PoseNotes = {
  summary?: string;
  stance?: string;
  weightDistribution?: string;
  regions?: PoseRegions;
  clo3dTips?: string[];
  imagePrompt?: string;
};

export type PoseAngle = "front" | "side" | "back";

export type PoseResult = {
  pose: PoseNotes;
  images: Record<PoseAngle, string | null>; // data: URLs, or null if that angle failed to generate
  zipBase64: string;
};

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || `Request failed with ${res.status}`;
  } catch {
    return `Request failed with ${res.status}`;
  }
}

/**
 * Uploads a reference photo and returns structured pose notes plus a
 * front/side/back turnaround of a neutral mannequin in that pose. Requires
 * a signed-in customer.
 */
export async function processPoseFile(token: string, file: File): Promise<PoseResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/pose-tool/process`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * Same as processPoseFile, but reports real upload progress via
 * XMLHttpRequest — used to drive the accurate first stage of the pose
 * tool page's progress UI (the analysis + image-generation stages that
 * follow are server-side work with no progress events of their own).
 */
export function processPoseFileWithProgress(
  token: string,
  file: File,
  onUploadProgress: (percent: number) => void
): Promise<PoseResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/pose-tool/process`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as PoseResult);
        return;
      }
      const errMsg = xhr.response?.error || `Request failed with ${xhr.status}`;
      reject(new Error(errMsg));
    };

    xhr.onerror = () => reject(new Error("Network error — check your connection and try again."));

    xhr.send(formData);
  });
}

/** Decodes the result's base64 zip into a downloadable Blob. */
export function poseZipToBlob(zipBase64: string): Blob {
  const bytes = atob(zipBase64);
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
  return new Blob([array], { type: "application/zip" });
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
