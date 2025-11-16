import Link from "next/link";

import { listActivePromotions, type PromotionPosition } from "@/lib/services/promotion-service";

interface PromotionBannerProps {
  position: PromotionPosition;
}

export async function PromotionBanner({ position }: PromotionBannerProps) {
  const promotions = await listActivePromotions({ position });

  if (promotions.length === 0) {
    return null;
  }

  const primary = promotions[0];

  return (
    <section className="rounded-xl border border-[var(--color-accent-dark)] bg-[var(--color-accent)]/5 px-4 py-3 text-sm shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
            Highlight
          </p>
          <h2 className="text-base font-semibold text-[var(--color-foreground)]">
            {primary.title}
          </h2>
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-3">{primary.content}</p>
        </div>
        {primary.ctaLink && primary.ctaText && (
          <div className="mt-2 md:mt-0">
            <Link
              href={primary.ctaLink}
              className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[var(--color-accent-dark)]"
            >
              {primary.ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
