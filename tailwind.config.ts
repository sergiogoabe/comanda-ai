import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PT Narrow", "system-ui", "sans-serif"],
        display: ["Play", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#9333EA",
          50: "#F5F0FF",
          100: "#EDE7FE",
          200: "#DBC9FE",
          300: "#C4A1FE",
          400: "#A855F7",
          500: "#9333EA",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        accent: {
          DEFAULT: "#06B6D4",
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
        surface: {
          DEFAULT: "#111118",
          50: "#FFFFFF",
          100: "#F5F5F7",
          200: "#E5E5E9",
          300: "#D1D1D8",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#3D3D4A",
          700: "#1F1F2E",
          800: "#161620",
          900: "#0D0D14",
        },
        error: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
      },
      borderRadius: {
        sm: "1.5px",
        md: "1.5px",
        lg: "1.5px",
        xl: "1.5px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0, 0, 0, 0.12)",
        md: "0 4px 12px rgba(0, 0, 0, 0.15)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.2)",
        glow: "0 0 30px rgba(147, 51, 234, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-slow": "pulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;