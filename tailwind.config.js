/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2C6DF9",
          primaryDark: "#1F4DB7",
          primarySoft: "#E7EEF9",
        },

        neutral: {
          900: "#0F172A",
          700: "#334155",
          500: "#64748B",
          300: "#CBD5E1",
          100: "#F1F5F9",
          50:  "#F8FAFC",
        },

        semantic: {
          success: "#22C55E",
          successBg: "#ECFDF5",

          warning: "#FACC15",
          warningBg: "#FFFBEB",

          error: "#EF4444",
          errorBg: "#FEF2F2",
        },
      },

      fontSize: {
        // Display Sizes
        "display-32": ["32px", { lineHeight: "40px", fontWeight: "600" }],

        // Headings
        "heading-24": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "heading-20": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "heading-18": ["18px", { lineHeight: "24px", fontWeight: "600" }],

        // Body
        "body-16": ["16px", { lineHeight: "24px" }],
        "body-14": ["14px", { lineHeight: "20px" }],
        "bodyMedium-16": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "bodyMedium-14": ["14px", { lineHeight: "20px", fontWeight: "500" }],

        // Label / Caption / Badge
        "label-12": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "caption-12": ["12px", { lineHeight: "16px" }],
        "badge-11": ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },

      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },

      boxShadow: {
        card: "0px 1px 2px rgba(16, 24, 40, 0.06), 0px 4px 12px rgba(16, 24, 40, 0.04)",
        focus: "0 0 0 2px rgba(44, 109, 249, 0.4)",
      },
    },
  },
  plugins: [],
};
