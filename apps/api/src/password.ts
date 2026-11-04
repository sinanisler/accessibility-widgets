import { hash, verify } from "@node-rs/argon2";

export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

let decoyHash: Promise<string> | null = null;

/** Spends the same time as a real check so a missing account is not detectable by timing. */
export async function verifyPasswordOrWaste(password: string): Promise<false> {
  decoyHash ??= hash("decoy-password");
  await verifyPassword(password, await decoyHash);
  return false;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}
