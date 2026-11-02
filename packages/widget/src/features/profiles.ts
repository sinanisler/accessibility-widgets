import { PROFILES } from "@a11y/core";
import type { FeatureModule } from "./types.js";
import type { AccessibilityStore } from "../state/store.js";

/** Guard against re-entrant profile application during applyAll() */
let applyingProfile = false;

export function createProfileFeatures(
  store: AccessibilityStore,
  applyAll: () => void,
): FeatureModule[] {
  return PROFILES.map((profile) => ({
    id: `profile-${profile.id}`,
    category: "profiles" as const,
    labelKey: profile.labelKey,
    levels: [true],
    apply(level) {
      if (!level || applyingProfile) return;
      applyingProfile = true;
      try {
        const next = { ...profile.features, [`profile-${profile.id}`]: true as const };
        // Clear other profile flags
        for (const p of PROFILES) {
          if (p.id !== profile.id) delete (next as Record<string, unknown>)[`profile-${p.id}`];
        }
        store.reset();
        store.setMany(next);
        applyAll();
      } finally {
        applyingProfile = false;
      }
    },
  }));
}
