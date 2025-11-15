import type { ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--color-accent-dark)] px-6 py-4 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">YEWAPDC</h1>
          <p className="text-xs text-[var(--color-muted)]">Yewa People&apos;s Development Council</p>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href="/articles" className="hover:text-[var(--color-accent)]">
            Articles
          </Link>
          <Link href="/events" className="hover:text-[var(--color-accent)]">
            Events
          </Link>
        </nav>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
      <footer className="border-t border-[var(--color-accent-dark)] px-6 py-4 text-xs text-[var(--color-muted)]">
        © {new Date().getFullYear()} YEWAPDC. All rights reserved.
      </footer>
    </div>
  );
}
