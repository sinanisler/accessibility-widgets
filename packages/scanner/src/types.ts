export type Severity = "critical" | "serious" | "moderate" | "minor";

export interface ScanIssue {
  id: string;
  ruleId: string;
  impact: Severity;
  message: string;
  helpUrl?: string;
  selector?: string;
  html?: string;
  wcag?: string[];
  source: "axe" | "arabic-rules";
}

export interface ScanReport {
  url: string;
  scannedAt: string;
  score: number;
  issues: ScanIssue[];
  summary: Record<Severity, number>;
}
