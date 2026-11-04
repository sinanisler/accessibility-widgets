const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8787";

/** Set by the API as an HttpOnly cookie; browser code never reads it, the browser just sends it. */
const SESSION_COOKIE = "muneer_session";

// Earlier builds kept the token in localStorage and a script-readable cookie. Clear both once.
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("muneer_token");
  } catch {
    /* storage blocked */
  }
  document.cookie = "muneer_token=; path=/; max-age=0; SameSite=Lax";
}

/**
 * A revoked session still leaves its cookie behind, and scripts cannot delete an HttpOnly cookie.
 * The API clears it first; otherwise middleware would bounce /login straight back here.
 */
// These answer 401 for a wrong password, which is not a lost session.
const CREDENTIAL_PATHS = ["/v1/auth/login", "/v1/auth/logout", "/v1/auth/password"];

function onUnauthorized(path: string): void {
  if (typeof window === "undefined" || CREDENTIAL_PATHS.includes(path)) return;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  void fetch(`${API_BASE}/v1/auth/logout`, { method: "POST", credentials: "include" })
    .catch(() => undefined)
    .finally(() => {
      window.location.href = `/login?next=${next}`;
    });
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store", credentials: "include" });
  if (res.status === 401) onUnauthorized(path);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiSend<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (res.status === 401) onUnauthorized(path);
  if (!res.ok) {
    let detail = `API ${res.status}`;
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) detail = err.error;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export { API_BASE, SESSION_COOKIE };
