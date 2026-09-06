import { Product } from "@/types/product";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface OnboardingResult {
  intro: string;
  products: Product[];
}

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || `Request failed with ${res.status}`;
  } catch {
    return `Request failed with ${res.status}`;
  }
}

/**
 * Powers the third step of /welcome: turns the styles + experience level a
 * brand-new user just picked into a short Gemini-written welcome note plus
 * a shortlist of real, in-stock products. Auth required — this only ever
 * runs once, right after signup.
 */
export async function fetchOnboardingPicks(
  token: string,
  payload: { styles: string[]; experience: string }
): Promise<OnboardingResult> {
  const res = await fetch(`${API_BASE}/assistant/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
