import type { Config } from "tailwindcss";

// Centralized Duolingo design tokens. Every screen pulls colors from here —
// never hardcode a hex in a component.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "duo-green": "#58CC02",
        "duo-green-dark": "#58A700",
        "duo-blue": "#1CB0F6",
        "duo-blue-dark": "#1899D6",
        "duo-red": "#FF4B4B",
        "duo-red-dark": "#EA2B2B",
        "duo-yellow": "#FFC800",
        "duo-yellow-dark": "#E6B800",
        "duo-purple": "#CE82FF",
        "duo-purple-dark": "#A568C9",
        "duo-teal": "#00CD9C",
        "duo-teal-dark": "#00A87E",
        "duo-fox": "#FF9600",
        "duo-eel": "#4B4B4B",
        "duo-wolf": "#777777",
        "duo-hare": "#AFAFAF",
        "duo-swan": "#E5E5E5",
        "duo-snow": "#F7F7F7",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // signature Duolingo "3D pressable button" bottom edge
        "duo-green": "0 4px 0 #58A700",
        "duo-blue": "0 4px 0 #1899D6",
        "duo-red": "0 4px 0 #EA2B2B",
        "duo-yellow": "0 4px 0 #E6B800",
        "duo-purple": "0 4px 0 #A568C9",
        "duo-teal": "0 4px 0 #00A87E",
        "duo-fox": "0 4px 0 #CC7A00",
        "duo-gray": "0 4px 0 #E5E5E5",
        "duo-card": "0 2px 0 #E5E5E5",
      },
      borderRadius: {
        "duo": "16px",
      },
      keyframes: {
        "pop-in": { "0%": { transform: "scale(0.8)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        "shake": { "0%,100%": { transform: "translateX(0)" }, "25%": { transform: "translateX(-6px)" }, "75%": { transform: "translateX(6px)" } },
        "bounce-in": { "0%": { transform: "translateY(-10px)" }, "50%": { transform: "translateY(2px)" }, "100%": { transform: "translateY(0)" } },
      },
      animation: {
        "pop-in": "pop-in 0.2s ease-out",
        "shake": "shake 0.4s ease-in-out",
        "bounce-in": "bounce-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
