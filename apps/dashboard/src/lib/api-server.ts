import { cookies } from "next/headers";
import { API_BASE, TOKEN_KEY } from "./api";

export async function serverApiGet<T>(path: string): Promise<T> {
  const jar = await cookies();
  const token = jar.get(TOKEN_KEY)?.value;
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {},
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}
