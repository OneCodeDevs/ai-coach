"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import type { Kapitel } from "@/lib/content/schemas";
import { FocusToggle } from "./focus-toggle";

type HeaderProps = {
  kapitel: Kapitel[];
  focusMode: boolean;
  progress: { done: number; total: number };
};

export function Header({ kapitel, focusMode, progress }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-void/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-ghost lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X aria-hidden={true} size={20} />
            ) : (
              <Menu aria-hidden={true} size={20} />
            )}
          </button>
          <Link
            href="/"
            translate="no"
            className="font-display text-lg tracking-[0.18em] text-fg no-underline hover:text-neon-cyan"
          >
            AI COACH
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <p
            className="hidden font-mono text-xs text-fg-muted tabular-nums md:block"
            aria-live="polite"
          >
            {progress.done}/{progress.total}
          </p>
          <Link
            href="/journal"
            className="btn btn-ghost hidden sm:inline-flex"
            aria-current={pathname.startsWith("/journal") ? "page" : undefined}
          >
            <BookOpen aria-hidden={true} size={18} />
            Tagebuch
          </Link>
          <FocusToggle initial={focusMode} />
        </div>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobilnavigation"
          className="max-h-[70dvh] overflow-y-auto border-t border-border-subtle bg-bg-base px-4 py-3 lg:hidden"
          style={{ overscrollBehavior: "contain" }}
        >
          <Link
            href="/"
            className="flex min-h-11 items-center text-fg no-underline"
            onClick={() => setOpen(false)}
          >
            Übersicht
          </Link>
          {kapitel.map((item) => (
            <Link
              key={item.slug}
              href={`/kapitel/${item.slug}`}
              className="flex min-h-11 items-center text-fg no-underline"
              onClick={() => setOpen(false)}
            >
              <span className="mr-2 font-mono text-neon-magenta tabular-nums">
                {String(item.nummer).padStart(2, "0")}
              </span>
              {item.titel}
            </Link>
          ))}
          <Link
            href="/journal"
            className="flex min-h-11 items-center text-fg no-underline"
            onClick={() => setOpen(false)}
          >
            Lerntagebuch
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
