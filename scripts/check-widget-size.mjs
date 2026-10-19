import { statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve("packages/widget/dist/muneer.js");
const raw = readFileSync(file);
const gzipped = gzipSync(raw);
const kb = gzipped.length / 1024;
const limit = 60;

console.log(`Widget gzip size: ${kb.toFixed(2)} KB (limit ${limit} KB)`);
console.log(`Raw size: ${(statSync(file).size / 1024).toFixed(2)} KB`);

if (kb > limit) {
  console.error("Bundle exceeds size budget");
  process.exit(1);
}
