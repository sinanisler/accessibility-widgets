import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0B5FFF",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans Arabic", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
