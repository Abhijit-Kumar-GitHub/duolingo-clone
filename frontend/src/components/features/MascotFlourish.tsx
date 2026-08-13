// A generic, original mascot-style bird flourish beside the path — round
// body, small wing, beak — deliberately NOT a reproduction of Duolingo's
// proprietary owl artwork (see the branding note in README.md/CLAUDE.md).
// Purely decorative, matches the assignment's "mascot-style flourishes" ask.
export function MascotFlourish() {
  return (
    <div className="absolute -right-24 top-0 hidden sm:block animate-bounce-in" aria-hidden="true">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="32" r="18" className="fill-duo-green" />
        <circle cx="28" cy="16" r="13" className="fill-duo-green" />
        <circle cx="22" cy="14" r="2.6" className="fill-white" />
        <circle cx="22.5" cy="14.5" r="1.2" className="fill-duo-eel" />
        <path d="M9 15 L1 12.5 L9 19 Z" className="fill-duo-fox" />
        <path d="M13 38 Q28 48 43 38" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <ellipse cx="42" cy="30" rx="6" ry="10" className="fill-duo-green-dark" transform="rotate(20 42 30)" />
      </svg>
    </div>
  );
}
