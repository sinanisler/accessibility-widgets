#!/usr/bin/env node
import { scanUrl } from "./scan.js";

async function main(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: a11y-scan <url>");
    process.exit(1);
  }
  const report = await scanUrl(url);
  console.log(JSON.stringify(report, null, 2));
  const blockers = report.summary.critical + report.summary.serious;
  process.exit(blockers > 0 ? 2 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
