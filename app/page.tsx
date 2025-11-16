import Link from "next/link";

import { PromotionBanner } from "@/components/public/promotion-banner";

export const revalidate = 60;

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8 md:px-8">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Yewa People&apos;s Development Council
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Working for the development of Yewa people and communities.
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] md:text-base">
            Explore recent news, programs, and events that showcase our work across education, health,
            economic empowerment, and community-building.
          </p>
        </div>

        {/* Hero promotion banner */}
        <PromotionBanner position="HERO" />

        <div className="grid gap-4 text-sm md:grid-cols-2">
          <Link
            href="/articles"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-card)]/80"
          >
            <h2 className="text-base font-semibold">Articles &amp; updates</h2>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Read stories, announcements, and reflections from YEWAPDC programs and partners.
            </p>
          </Link>
          <Link
            href="/events"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-card)]/80"
          >
            <h2 className="text-base font-semibold">Events &amp; engagements</h2>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Find upcoming programs, trainings, and community gatherings in Yewaland and beyond.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
