/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ---- COLORS (from your design system) ----
      colors: {
        // Brand
        brand: {
          primary: "#2563EB",      // Brand / Primary
          primaryDark: "#1D4ED8",  // Brand / Primary Dark
          primarySoft: "#EFF4FF",  // Brand / Primary Soft
        },

        // Neutral scale
        neutral: {
          900: "#020617", // Neutral / 900
          700: "#334155", // Neutral / 700
          500: "#64748B", // Neutral / 500
          300: "#CBD5F5", // Neutral / 300
          100: "#E5E7EB", // Neutral / 100
          50:  "#F9FAFB", // Neutral / 50
        },

        // Semantic
        semantic: {
          success: "#16A34A",   // Success
          successBg: "#DCFCE7", // Success Bg
          warning: "#F97316",   // Warning
          warningBg: "#FFEDD5", // Warning Bg
          error: "#DC2626",     // Error
          errorBg: "#FEE2E2",   // Error Bg
        },
      },

      // ---- TYPOGRAPHY ----
      fontFamily: {
        // You can swap "system-ui" with Inter via next/font later
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        // Display / 32
        "display-32": ["2rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em" }],

        // Heading / 24 / 20 / 18
        "heading-24": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.01em" }],
        "heading-20": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "heading-18": ["1.125rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em" }],

        // Body / 16 / 14
        "body-16": ["1rem", { lineHeight: "1.5rem" }],
        "body-14": ["0.875rem", { lineHeight: "1.4rem" }],

        // Label / Caption / Badge
        "label-12": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
        "caption-12": ["0.75rem", { lineHeight: "1rem" }],
        "badge-11": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
      },

      borderRadius: {
        DEFAULT: "12px",
        md: "14px",
        lg: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 8px 28px rgba(2,8,20,.05)",
      },
    },
  },
  plugins: [],
};
