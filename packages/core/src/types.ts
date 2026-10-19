export type FeatureCategory = "visual" | "cognitive" | "navigation" | "reader" | "profiles";

export type FeatureLevel = string | number | boolean;

export interface FeatureDefinition {
  id: string;
  category: FeatureCategory;
  levels?: FeatureLevel[];
  defaultLevel?: FeatureLevel;
}

export interface WidgetColors {
  primary: string;
  background: string;
  text: string;
  accent: string;
}

export type WidgetPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export type ButtonIconId = "person" | "a11y" | "eye" | "text";

export type WidgetTheme = "light" | "dark" | "auto";

export interface FeatureConfigEntry {
  id: string;
  enabled: boolean;
  order: number;
  defaultLevel?: FeatureLevel | null;
  allowedLevels?: FeatureLevel[];
}

export interface WidgetOffset {
  x: number;
  y: number;
}

export interface MobileWidgetOptions {
  position?: WidgetPosition;
  hide?: boolean;
}

export type LabelOverrides = Record<string, Partial<Record<string, string>>>;

export interface WidgetConfig {
  schemaVersion?: number;
  siteKey?: string;
  apiBaseUrl?: string;
  language?: string;
  defaultLanguage?: string;
  autoDetectLanguage?: boolean;
  position?: WidgetPosition;
  widgetWidth?: string;
  colors?: Partial<WidgetColors>;
  /** @deprecated Prefer `features` entries; kept for migration. */
  enabledFeatures?: string[];
  /** @deprecated Prefer `features` entries; kept for migration. */
  disabledFeatures?: string[];
  features?: FeatureConfigEntry[];
  offset?: WidgetOffset;
  buttonSize?: number;
  buttonIcon?: ButtonIconId;
  theme?: WidgetTheme;
  mobile?: MobileWidgetOptions;
  radius?: number;
  labels?: LabelOverrides;
  statementUrl?: string;
  /** Kill switch — when false the widget does not mount. */
  enabled?: boolean;
  excludedPaths?: string[];
  persistPreferences?: boolean;
  enableAnalytics?: boolean;
  enableCloudTts?: boolean;
  openShortcut?: string;
}

export interface FeatureState {
  [featureId: string]: FeatureLevel | null;
}

export interface UsageEvent {
  siteKey: string;
  event: string;
  featureId?: string;
  timestamp: string;
  path?: string;
}

export type ProfileId =
  | "low-vision"
  | "epilepsy"
  | "adhd"
  | "dyslexia"
  | "seniors"
  | "blind"
  | "motor";

export interface AccessibilityProfile {
  id: ProfileId;
  labelKey: string;
  features: FeatureState;
}

export interface ContrastCheckResult {
  ratio: number;
  passesAa: boolean;
  warning?: string;
}
