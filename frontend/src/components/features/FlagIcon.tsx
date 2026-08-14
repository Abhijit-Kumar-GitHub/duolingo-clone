// Windows' emoji font (Segoe UI Emoji) doesn't render flag-emoji ligatures
// at all — 🇪🇸 falls back to the bare two-letter region code "ES" instead of
// a flag glyph. These are small hand-drawn SVG flags instead, so the course
// switcher shows an actual flag image on every platform, not just ones with
// full flag-emoji support.
export type FlagCode = "es" | "fr" | "de" | "jp" | "it";

const FLAGS: Record<FlagCode, React.ReactNode> = {
  es: (
    <>
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </>
  ),
  fr: (
    <>
      <rect width="24" height="16" fill="#FFFFFF" />
      <rect width="8" height="16" fill="#0055A4" />
      <rect x="16" width="8" height="16" fill="#EF4135" />
    </>
  ),
  de: (
    <>
      <rect width="24" height="16" fill="#FFCE00" />
      <rect width="24" height="10.67" fill="#000000" />
      <rect width="24" height="5.33" fill="#DD0000" />
    </>
  ),
  jp: (
    <>
      <rect width="24" height="16" fill="#FFFFFF" />
      <circle cx="12" cy="8" r="4.8" fill="#BC002D" />
    </>
  ),
  it: (
    <>
      <rect width="24" height="16" fill="#FFFFFF" />
      <rect width="8" height="16" fill="#009246" />
      <rect x="16" width="8" height="16" fill="#CE2B37" />
    </>
  ),
};

export function FlagIcon({ code, size = 20, className }: { code: FlagCode; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      width={size}
      height={(size * 16) / 24}
      className={className}
      style={{ borderRadius: 2 }}
    >
      {FLAGS[code]}
    </svg>
  );
}
