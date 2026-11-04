import { cookies } from "next/headers";
import { API_BASE, SESSION_COOKIE } from "./api";

/** Server components forward the visitor's session cookie, which is HttpOnly and readable here. */
export async function serverApiGet<T>(path: string): Promise<T> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const res = await fetch(`${process.env.API_INTERNAL_URL || API_BASE}${path}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}
