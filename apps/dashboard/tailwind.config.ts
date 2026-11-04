import type { Config } from "tailwindcss";

// Colors are CSS variables (see globals.css) so one class works in both themes.
// Brand values match the widget defaults in @a11y/core so dashboard previews feel native.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: v("surface"),
        brand: {
          DEFAULT: v("brand"),
          hover: v("brand-hover"),
          soft: v("brand-soft"),
          ink: v("brand-ink"),
          fg: v("brand-fg"),
        },
        amber: {
          brand: "#F2A900",
        },
        ink: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => [step, v(`ink-${step}`)]),
        ),
        success: { DEFAULT: v("success"), soft: v("success-soft"), line: v("success-line") },
        warning: { DEFAULT: v("warning"), soft: v("warning-soft"), line: v("warning-line") },
        danger: { DEFAULT: v("danger"), soft: v("danger-soft"), line: v("danger-line") },
      },
      fontFamily: {
        sans: ["IBM Plex Sans Arabic", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,24,33,.04), 0 1px 1px rgba(20,24,33,.03)",
        pop: "0 24px 60px -12px rgba(18,24,40,.3), 0 2px 6px rgba(18,24,40,.08)",
      },
    },
  },
  plugins: [],
};

export default config;
