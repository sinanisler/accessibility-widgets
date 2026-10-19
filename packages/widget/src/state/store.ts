import type { FeatureLevel, FeatureState, WidgetConfig } from "@a11y/core";
import { mergeWidgetConfig } from "@a11y/core";

const STORAGE_KEY = "a11y-platform-state-v1";

export type StoreListener = (state: FeatureState) => void;

export class AccessibilityStore {
  private state: FeatureState = {};
  private listeners = new Set<StoreListener>();
  config: WidgetConfig;

  constructor(userConfig?: Partial<WidgetConfig>) {
    this.config = mergeWidgetConfig(userConfig);
    this.state = this.load();
    this.applyDefaultsIfEmpty();
  }

  getState(): FeatureState {
    return { ...this.state };
  }

  get(id: string): FeatureLevel | null {
    return this.state[id] ?? null;
  }

  set(id: string, value: FeatureLevel | null): void {
    if (value === null || value === false) {
      delete this.state[id];
    } else {
      this.state[id] = value;
    }
    this.persist();
    this.emit();
  }

  setMany(partial: FeatureState): void {
    for (const [id, value] of Object.entries(partial)) {
      if (value === null || value === false) delete this.state[id];
      else this.state[id] = value;
    }
    this.persist();
    this.emit();
  }

  reset(): void {
    this.state = {};
    this.applyDefaultsIfEmpty();
    this.persist();
    this.emit();
  }

  replaceConfig(config: WidgetConfig): void {
    this.config = mergeWidgetConfig(config);
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private applyDefaultsIfEmpty(): void {
    for (const entry of this.config.features ?? []) {
      if (!entry.enabled) continue;
      if (entry.defaultLevel === null || entry.defaultLevel === undefined) continue;
      if (this.state[entry.id] !== undefined) continue;
      this.state[entry.id] = entry.defaultLevel;
    }
  }

  private emit(): void {
    const snapshot = this.getState();
    for (const l of this.listeners) l(snapshot);
  }

  private persist(): void {
    if (this.config.persistPreferences === false) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* ignore quota / private mode */
    }
  }

  private load(): FeatureState {
    if (this.config.persistPreferences === false) return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as FeatureState;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
}
