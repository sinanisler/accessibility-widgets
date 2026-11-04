import type { ScanIssue } from "./types.js";

export async function runArabicRules(page: {
  evaluate: <T>(fn: () => T) => Promise<T>;
}): Promise<ScanIssue[]> {
  const findings = await page.evaluate(() => {
    const issues: Array<{
      id: string;
      ruleId: string;
      impact: "critical" | "serious" | "moderate" | "minor";
      message: string;
      selector?: string;
      html?: string;
      wcag?: string[];
    }> = [];

    const html = document.documentElement;
    const lang = (html.getAttribute("lang") || "").toLowerCase();
    const dir = (html.getAttribute("dir") || "").toLowerCase();
    const textSample = (document.body?.innerText || "").slice(0, 2000);
    const hasArabic = /[\u0600-\u06FF]/.test(textSample);

    if (hasArabic && !lang.startsWith("ar")) {
      issues.push({
        id: "ar-lang-missing",
        ruleId: "arabic-lang",
        impact: "serious",
        message: "الصفحة تحتوي نصاً عربياً لكن خاصية lang ليست ar",
        selector: "html",
        html: html.outerHTML.slice(0, 200),
        wcag: ["3.1.1"],
      });
    }

    if (hasArabic && dir !== "rtl") {
      issues.push({
        id: "ar-dir-missing",
        ruleId: "arabic-dir",
        impact: "serious",
        message: "المحتوى العربي يفتقد dir=\"rtl\" على عنصر html",
        selector: "html",
        wcag: ["1.3.2"],
      });
    }

    // Very rough contrast hint for inline styles with light gray on white
    document.querySelectorAll<HTMLElement>("[style*='color']").forEach((el, index) => {
      const color = el.style.color.toLowerCase();
      if (color.includes("rgb(200") || color.includes("#ccc") || color.includes("#ddd")) {
        issues.push({
          id: `contrast-hint-${index}`,
          ruleId: "arabic-contrast-hint",
          impact: "moderate",
          message: "لون نص فاتح قد يضعف التباين خاصة مع الخطوط العربية",
          selector: el.tagName.toLowerCase(),
          html: el.outerHTML.slice(0, 200),
          wcag: ["1.4.3"],
        });
      }
    });

    return issues;
  });

  return findings.map((f) => ({ ...f, source: "arabic-rules" as const }));
}
