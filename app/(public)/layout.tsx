import type { ReactNode } from "react";
import Link from "next/link";

import {
  getNavigationMenuByLocation,
  listSettings,
  type NavItem,
} from "@/lib/services/settings-service";

function getSettingValue(records: Awaited<ReturnType<typeof listSettings>>, key: string): string {
  const record = records.find((setting) => setting.key === key);
  return record?.value ?? "";
}

function NavLinks({ items }: { items: NavItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex flex-wrap gap-4 text-sm">
      {items.map((item) => {
        if (!item.label || !item.url) return null;

        if (item.external) {
          return (
            <a
              key={item.label + item.url}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--color-accent)]"
            >
              {item.label}
            </a>
          );
        }

        return (
          <Link
            key={item.label + item.url}
            href={item.url}
            className="hover:text-[var(--color-accent)]"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [settings, headerMenu, footerMenu] = await Promise.all([
    listSettings(),
    getNavigationMenuByLocation("HEADER"),
    getNavigationMenuByLocation("FOOTER"),
  ]);

  const siteName = getSettingValue(settings, "site.name") || "YEWAPDC";
  const siteTagline =
    getSettingValue(settings, "site.tagline") || "Yewa People&apos;s Development Council";

  const headerItems = (headerMenu?.items as NavItem[] | null | undefined) ?? [];
  const footerItems = (footerMenu?.items as NavItem[] | null | undefined) ?? [];

  const contactEmail = getSettingValue(settings, "site.contact.email");
  const contactPhone = getSettingValue(settings, "site.contact.phone");
  const socialFacebook = getSettingValue(settings, "site.social.facebook");
  const socialTwitter = getSettingValue(settings, "site.social.twitter");
  const socialInstagram = getSettingValue(settings, "site.social.instagram");

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <a
        href="#public-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--color-background)] focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to main content
      </a>
      <header className="border-b border-[var(--color-accent-dark)] px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">{siteName}</h1>
          <p className="text-xs text-[var(--color-muted)]" dangerouslySetInnerHTML={{ __html: siteTagline }} />
        </div>
        <nav aria-label="Primary navigation">
          <NavLinks items={headerItems} />
        </nav>
      </header>
      <main id="public-main-content" className="flex-1 px-6 py-8">{children}</main>
      <footer className="border-t border-[var(--color-accent-dark)] px-6 py-4 text-xs text-[var(--color-muted)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-0.5">
            <p>
              © {year} {siteName}. All rights reserved.
            </p>
            {(contactEmail || contactPhone) && (
              <p>
                {contactEmail && (
                  <>
                    <a href={`mailto:${contactEmail}`} className="hover:text-[var(--color-accent)]">
                      {contactEmail}
                    </a>
                    {contactPhone ? " · " : ""}
                  </>
                )}
                {contactPhone}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <nav aria-label="Footer navigation">
              <NavLinks items={footerItems} />
            </nav>
            {(socialFacebook || socialTwitter || socialInstagram) && (
              <div className="flex flex-wrap gap-3">
                {socialFacebook && (
                  <a
                    href={socialFacebook}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--color-accent)]"
                  >
                    Facebook
                  </a>
                )}
                {socialTwitter && (
                  <a
                    href={socialTwitter}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--color-accent)]"
                  >
                    Twitter
                  </a>
                )}
                {socialInstagram && (
                  <a
                    href={socialInstagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--color-accent)]"
                  >
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

