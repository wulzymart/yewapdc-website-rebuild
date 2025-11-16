"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  HomeIcon,
  NewspaperIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  PhotoIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface AdminNavProps {
  canSeeReviewQueue: boolean;
  canSeeUsers: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  requiresReviewQueue?: boolean;
  requiresUsers?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/articles", label: "Articles", icon: NewspaperIcon },
  { href: "/admin/events", label: "Events", icon: CalendarDaysIcon },
  { href: "/admin/promotions", label: "Promotions", icon: MegaphoneIcon },
  { href: "/admin/review", label: "Review queue", icon: NewspaperIcon, requiresReviewQueue: true },
  { href: "/admin/media", label: "Media library", icon: PhotoIcon },
  { href: "/admin/persons", label: "Persons & offices", icon: UserGroupIcon },
  { href: "/admin/settings", label: "Site settings", icon: Cog6ToothIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon, requiresUsers: true },
];

export function AdminNav({ canSeeReviewQueue, canSeeUsers }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 text-sm" aria-label="Admin navigation">
      {NAV_ITEMS.filter((item) => {
        if (item.requiresReviewQueue && !canSeeReviewQueue) return false;
        if (item.requiresUsers && !canSeeUsers) return false;
        return true;
      }).map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 transition-colors bg-[var(--color-accent)]",
              isActive
                ? "bg-[var(--color-accent)]/60 text-[var(--color-accent-foreground)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-accent)]/5 hover:text-[var(--color-foreground)]",
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
