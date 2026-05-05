import Link from "next/link";
import { getCerebroMode } from "@/lib/cerebro/db";

const navItems = [
  { href: "/today", label: "Today" },
  { href: "/entries", label: "Entries" },
  { href: "/tasks", label: "Tasks" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const mode = getCerebroMode();

  return (
    <div className="min-h-screen bg-[#080b0d] text-zinc-100">
      <header className="border-b border-zinc-800 bg-[#0b0f12]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <Link href="/today" className="font-mono text-xl font-semibold">
              λnexus
            </Link>
            <p className="mt-1 text-sm text-zinc-400">
              Private λstepweaver control layer for Cerebro Phase 1
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-cyan-900/80 bg-cyan-950/40 px-2 py-1 font-mono text-xs uppercase text-cyan-200">
              {mode}
            </span>
            <nav className="flex rounded border border-zinc-800 bg-zinc-950 p-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
