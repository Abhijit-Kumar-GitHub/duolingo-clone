import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeInit } from "@/components/features/ThemeInit";
import { THEME_STORAGE_KEY } from "@/store/useThemeStore";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Lingo — the free, fun way to learn a language",
  description: "Learn a language for free, forever.",
};

// Runs before first paint, ahead of React, so a dark-mode user never sees a
// frame of white. It has to be inline and synchronous in <head> for that —
// anything in a component or an effect is already too late. Falls back to
// the OS preference when nothing has been chosen yet.
const themeBootScript = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var dark = stored
      ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${nunito.variable} font-sans antialiased`}>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
