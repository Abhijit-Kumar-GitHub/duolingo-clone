import clsx from "clsx";
import { DuoMark } from "./DuoOwl";

/**
 * The product wordmark, as a mascot-plus-lettering lockup rather than the
 * bare text span the sidebar used before.
 *
 * "lingo" is this clone's own name — deliberately not Duolingo's wordmark,
 * which is a trademarked custom typeface. What's being matched is the
 * *treatment*: lowercase, very heavy weight, tight tracking, brand green,
 * paired with the mascot on the left. Nunito (already the app's body font,
 * see app/layout.tsx) is a rounded geometric sans, so its Black weight sits
 * naturally in that same visual family without needing a font file just for
 * the logo.
 */
export function Logo({ size = "md", className }: { size?: "sm" | "md"; className?: string }) {
  const mark = size === "sm" ? 26 : 34;
  return (
    <span className={clsx("inline-flex items-center gap-2 select-none", className)}>
      <DuoMark size={mark} />
      <span
        className={clsx(
          "font-black text-duo-green leading-none tracking-tight",
          size === "sm" ? "text-xl" : "text-3xl"
        )}
      >
        lingo
      </span>
    </span>
  );
}
