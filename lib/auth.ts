const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
  /** True only when this call just created the account (first signup, or
   *  first-ever Google sign-in) — used to route straight to /welcome. */
  isNewUser?: boolean;
}

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.error || `Request failed with ${res.status}`;
  } catch {
    return `Request failed with ${res.status}`;
  }
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function signin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/**
 * Exchanges a Google Identity Services ID token (NOT an access token) for a
 * FabricNow session. Same endpoint handles both "sign in" and "sign up" —
 * the backend creates the account on first use, since there's no separate
 * password step to distinguish the two.
 */
export async function googleAuth(credential: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function fetchMe(token: string): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Updates the signed-in user's profile (currently just display name). */
export async function updateProfile(token: string, updates: { name: string }): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Changes the signed-in user's password (requires the current one). */
export async function changePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string }
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
}
