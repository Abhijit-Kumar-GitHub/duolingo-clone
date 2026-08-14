import type { Config } from "tailwindcss";

// Centralized Duolingo design tokens. Every screen pulls colors from here —
// never hardcode a hex in a component.
// Themed tokens resolve through a CSS variable so light/dark is one class on
// <html> rather than a `dark:` variant on every element (see globals.css).
// The `<alpha-value>` placeholder is what keeps opacity modifiers working:
// `bg-duo-snow/60` compiles to `rgb(var(--duo-snow) / 0.6)`.
const themed = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand — identical in both themes. Duolingo's palette is the
        // product's identity; it doesn't dim in the dark.
        "duo-green": "#58CC02",
        "duo-green-dark": "#58A700",
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
        // Super (the subscription upsell) is the one surface that doesn't use
        // the learning palette — it has its own indigo CTA and a
        // green→blue→violet brand gradient.
        "duo-indigo": "#4B4BFF",
        "duo-indigo-dark": "#3A3AD1",

        // Themed — the neutral ramp, which is what actually flips.
        "duo-bg": themed("duo-bg"),           // page background
        "duo-card": themed("duo-card"),       // cards, panels, popovers
        "duo-snow": themed("duo-snow"),       // subtle fill / hover
        "duo-swan": themed("duo-swan"),       // borders + dividers
        "duo-eel": themed("duo-eel"),         // primary text
        "duo-wolf": themed("duo-wolf"),       // secondary text
        "duo-hare": themed("duo-hare"),       // muted / disabled
        "duo-blue": themed("duo-blue"),       // links + selection
        "duo-inverse": themed("duo-inverse"), // toasts + tooltips
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
        "duo-indigo": "0 4px 0 #3A3AD1",
        "duo-gray": "0 4px 0 rgb(var(--duo-swan))",
        "duo-card": "0 2px 0 rgb(var(--duo-swan))",
      },
      borderRadius: {
        "duo": "16px",
      },
      keyframes: {
        "pop-in": { "0%": { transform: "scale(0.8)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        "shake": { "0%,100%": { transform: "translateX(0)" }, "25%": { transform: "translateX(-6px)" }, "75%": { transform: "translateX(6px)" } },
        "bounce-in": { "0%": { transform: "translateY(-10px)" }, "50%": { transform: "translateY(2px)" }, "100%": { transform: "translateY(0)" } },
        // Idle float for the openable treasure chest on the path — the only
        // node that's a one-shot action rather than a lesson, so it gets a
        // motion cue instead of the "Start" bubble the current lesson uses.
        "bob": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-5px)" } },
      },
      animation: {
        "pop-in": "pop-in 0.2s ease-out",
        "shake": "shake 0.4s ease-in-out",
        "bounce-in": "bounce-in 0.4s ease-out",
        "bob": "bob 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
