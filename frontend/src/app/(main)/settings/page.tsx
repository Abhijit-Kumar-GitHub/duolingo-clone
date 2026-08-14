import { ThemeToggle } from "@/components/features/ThemeToggle";

// Mostly a placeholder per the assignment's allowed-mocks list, but the
// appearance section is real — and it needs to be reachable here as well as
// from the sidebar's More menu, because the sidebar is hidden below `md` and
// the bottom tab bar has no room for an overflow menu.
export default function SettingsPage() {
  return (
    <div className="max-w-lg mx-auto pt-8 pb-16">
      <h1 className="text-2xl font-extrabold text-duo-eel mb-6">Settings</h1>

      <h2 className="text-xs font-extrabold uppercase tracking-wide text-duo-wolf mb-2">Appearance</h2>
      <div className="border border-duo-swan rounded-2xl overflow-hidden mb-8">
        <ThemeToggle className="py-4" />
      </div>

      <h2 className="text-xs font-extrabold uppercase tracking-wide text-duo-wolf mb-2">Account</h2>
      <div className="border border-duo-swan rounded-2xl divide-y divide-duo-swan">
        {["Profile", "Notifications", "Super subscription", "Privacy settings"].map((row) => (
          <div key={row} className="flex items-center justify-between px-4 py-4">
            <span className="text-sm font-bold text-duo-hare">{row}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-duo-blue bg-duo-blue/10 px-2 py-1 rounded-full">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
