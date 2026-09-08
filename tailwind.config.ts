import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: "#0B0F17",
          light: "#F8FAFC",
        },
        surface: {
          DEFAULT: "#131B2A",
          subtle: "#1E293B",
          light: "#FFFFFF",
          "subtle-light": "#F1F5F9",
        },
        border: {
          subtle: "#293548",
          "subtle-light": "#E2E8F0",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          "primary-light": "#0F172A",
          "secondary-light": "#475569",
        },
        brand: {
          growth: "#10B981",
          "growth-hover": "#059669",
          focus: "#3B82F6",
          "focus-hover": "#2563EB",
          warning: "#F59E0B",
          risk: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
