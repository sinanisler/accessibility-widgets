import { chromium } from "playwright";
import axeCore from "axe-core";
import { runArabicRules } from "./arabic-rules.js";
import type { ScanIssue, ScanReport, Severity } from "./types.js";

function scoreFromIssues(issues: ScanIssue[]): number {
  const weights: Record<Severity, number> = {
    critical: 15,
    serious: 8,
    moderate: 3,
    minor: 1,
  };
  const penalty = issues.reduce((sum, i) => sum + (weights[i.impact] ?? 1), 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

function summarize(issues: ScanIssue[]): Record<Severity, number> {
  const summary: Record<Severity, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  for (const i of issues) summary[i.impact] += 1;
  return summary;
}

export async function scanUrl(url: string): Promise<ScanReport> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    await page.addScriptTag({ content: axeCore.source });
    const axeResults = await page.evaluate(async () => {
      // @ts-expect-error axe injected
      return await axe.run(document, { resultTypes: ["violations"] });
    });

    const axeIssues: ScanIssue[] = (axeResults.violations || []).flatMap(
      (v: {
        id: string;
        impact?: string;
        description: string;
        helpUrl?: string;
        tags?: string[];
        nodes: Array<{ target: string[]; html: string }>;
      }) =>
        v.nodes.map((n, idx) => ({
          id: `axe-${v.id}-${idx}`,
          ruleId: v.id,
          impact: (v.impact as Severity) || "moderate",
          message: v.description,
          helpUrl: v.helpUrl,
          selector: n.target?.join(" "),
          html: n.html?.slice(0, 300),
          wcag: (v.tags || []).filter((t) => t.startsWith("wcag")),
          source: "axe" as const,
        })),
    );

    const arabicIssues = await runArabicRules(page);
    const issues = [...axeIssues, ...arabicIssues];

    return {
      url,
      scannedAt: new Date().toISOString(),
      score: scoreFromIssues(issues),
      issues,
      summary: summarize(issues),
    };
  } finally {
    await browser.close();
  }
}

export async function scanMany(urls: string[]): Promise<ScanReport[]> {
  const reports: ScanReport[] = [];
  for (const url of urls) {
    reports.push(await scanUrl(url));
  }
  return reports;
}
