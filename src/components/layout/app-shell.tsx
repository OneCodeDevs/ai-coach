import Link from "next/link";
import type { Kapitel } from "@/lib/content/schemas";
import { Header } from "./header";

type AppShellProps = {
  children: React.ReactNode;
  kapitel: Kapitel[];
  focusMode: boolean;
  progress: { done: number; total: number };
};

export function AppShell({ children, kapitel, focusMode, progress }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-bg-void text-fg">
      <a className="skip-link" href="#inhalt">
        Zum Inhalt springen
      </a>
      <Header kapitel={kapitel} focusMode={focusMode} progress={progress} />
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 pb-16 pt-4 md:px-6 lg:px-8">
        <aside className="sticky top-24 hidden h-[calc(100dvh-7rem)] w-64 shrink-0 overflow-y-auto lg:block">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-fg-muted">
            Kapitel
          </p>
          <nav aria-label="Kapitel" className="mt-3 flex flex-col gap-1">
            {kapitel.map((item) => (
              <Link
                key={item.slug}
                href={`/kapitel/${item.slug}`}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-fg no-underline hover:bg-bg-elevated hover:text-neon-cyan"
              >
                <span className="mr-2 font-mono text-neon-magenta">
                  {String(item.nummer).padStart(2, "0")}
                </span>
                <span className="line-clamp-2">{item.titel}</span>
              </Link>
            ))}
            <Link
              href="/journal"
              className="mt-3 flex min-h-11 items-center rounded-md px-3 text-sm text-fg-muted no-underline hover:text-neon-cyan"
            >
              Lerntagebuch
            </Link>
          </nav>
        </aside>
        <main id="inhalt" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
