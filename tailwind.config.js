/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#FAFAFA",
          muted: "#F6F7F8",
        },
        line: {
          subtle: "#EFEFEF",
          muted: "#E7E9EC",
          strong: "#D8DDE5",
        },
        text: {
          DEFAULT: "#0E1116",
          soft: "#3D4350",
          muted: "#6B7280",
        },
        brand: {
          50:  "#EEF4FF",
          100: "#DFE9FF",
          200: "#C4D7FF",
          300: "#A3C0FF",
          400: "#7EA6FF",
          500: "#4E8DFF",
          600: "#3D73E6",
          700: "#315ECC",
          800: "#294EA8",
          900: "#22428C",
          DEFAULT: "#4E8DFF",
        },
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
