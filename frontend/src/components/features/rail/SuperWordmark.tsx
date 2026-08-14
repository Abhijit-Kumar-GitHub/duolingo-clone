import clsx from "clsx";

/**
 * The "SUPER" lettering — italic, heavy, and filled with the subscription's
 * green→blue→violet gradient rather than a flat colour or a solid pill.
 * Shared by SuperCard (rail) and SuperBanner (shop) so the two upsells can't
 * drift apart.
 *
 * `bg-clip-text` + a transparent text colour paints the gradient through the
 * glyphs; there's no image involved, so it stays crisp at any size.
 */
export function SuperWordmark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-block font-black italic tracking-tight text-transparent bg-clip-text",
        "bg-[linear-gradient(90deg,#00CD9C_0%,#1CB0F6_45%,#CE82FF_100%)]",
        className
      )}
    >
      SUPER
    </span>
  );
}
