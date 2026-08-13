import { FooterLinks } from "./FooterLinks";

// Fixed-width right column matching real Duolingo's desktop 3-column layout
// (left nav / center path / right rail of promo + league + quest widgets).
// Hidden below `lg` — narrower viewports get the bottom tab bar instead, so
// there isn't room for a third column.
export function RightRail({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[320px] shrink-0 pt-4">
      {children}
      <FooterLinks />
    </aside>
  );
}
