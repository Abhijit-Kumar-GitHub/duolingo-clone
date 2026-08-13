// Static, non-functional footer links — matches real Duolingo's right-rail
// footer. Deliberately inert (no real About/Blog/Careers pages exist here);
// present purely for visual parity.
const LINKS = ["About", "Blog", "Store", "Efficacy", "Careers", "Investors", "Terms", "Privacy"];

export function FooterLinks() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-2 text-xs font-bold text-duo-hare">
      {LINKS.map((label) => (
        <span key={label} className="cursor-default hover:text-duo-wolf transition-colors">
          {label}
        </span>
      ))}
    </div>
  );
}
