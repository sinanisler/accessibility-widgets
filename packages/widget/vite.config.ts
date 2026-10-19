import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AccessibilityWidget",
      formats: ["iife", "es"],
      fileName: (format) => (format === "iife" ? "muneer.js" : "muneer.mjs"),
    },
    minify: "esbuild",
    sourcemap: true,
    target: "es2020",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: false,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  test: {
    environment: "jsdom",
  },
});
