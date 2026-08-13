import { LucideIcon } from "lucide-react";

export function ComingSoon({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[70vh] max-w-sm mx-auto gap-3">
      <div className="bg-duo-swan/60 rounded-full p-6 mb-2">
        <Icon size={44} className="text-duo-hare" />
      </div>
      <h1 className="text-xl font-extrabold text-duo-eel">{title}</h1>
      <p className="text-duo-wolf text-sm">{description}</p>
      <span className="mt-3 text-xs font-extrabold uppercase tracking-wide text-duo-blue bg-duo-blue/10 px-3 py-1.5 rounded-full">
        Coming soon
      </span>
    </div>
  );
}
