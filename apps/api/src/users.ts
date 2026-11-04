import { randomBytes } from "node:crypto";

export const ROLES = ["owner", "admin", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const PASSWORD_MIN_LENGTH = 10;

/** Owners grant any role; admins can add admins and viewers but never create an owner. */
export function canAssignRole(actorRole: string, role: string): boolean {
  if (actorRole === "owner") return (ROLES as readonly string[]).includes(role);
  if (actorRole === "admin") return role === "admin" || role === "viewer";
  return false;
}

type Member = { id: string; role: string };

/**
 * Why a change to `target` is refused, or null when it is allowed. `nextRole` is null for removal.
 * Nobody edits themselves here (that would let the last owner lock the organisation out), admins
 * cannot touch owners, and the organisation always keeps at least one owner.
 */
export function memberChangeError(
  actor: Member,
  target: Member,
  nextRole: string | null,
  ownerCount: number,
): string | null {
  if (actor.id === target.id) return "Cannot change your own membership";
  if (actor.role !== "owner" && target.role === "owner") return "Forbidden";
  if (nextRole !== null && !canAssignRole(actor.role, nextRole)) return "Forbidden";
  if (actor.role === "viewer") return "Forbidden";
  const losesOwner = target.role === "owner" && nextRole !== "owner";
  if (losesOwner && ownerCount <= 1) return "Organisation needs an owner";
  return null;
}

/** Shown once to the inviter, who passes it on; the new member changes it after signing in. */
export function temporaryPassword(): string {
  return randomBytes(12).toString("base64url");
}
