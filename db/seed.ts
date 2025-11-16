import { config } from "dotenv";

config({ path: ".env.local" });
import { users, categories, siteSettings, navigationMenus } from "@/db/schema";
import type { NavItem } from "@/lib/services/settings-service";

async function main() {
  const { db } = await import("@/lib/db/drizzle");
  // Ensure at least one admin user exists
  const existingUsers = await db.select().from(users).limit(25);
  const hasAdmin = existingUsers.some((u) => u.role === "ADMIN");

  if (!hasAdmin) {
    await db.insert(users).values({
      id: "seed-admin",
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
      passwordHash: "seed-placeholder", // actual auth will be managed by better-auth
    });
  }

  // Basic article and event categories
  const existingCategories = await db.select().from(categories).limit(1);
  if (existingCategories.length === 0) {
    await db.insert(categories).values([
      {
        name: "News",
        slug: "news",
        type: "ARTICLE",
      },
      {
        name: "Events",
        slug: "events",
        type: "EVENT",
      },
    ]);
  }

  // Basic site settings
  const existingSettings = await db.select().from(siteSettings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(siteSettings).values([
      {
        key: "site_name",
        value: "YEWAPDC",
        type: "STRING",
      },
      {
        key: "site_description",
        value: "Yewa People's Development Council",
        type: "TEXT",
      },
    ]);
  }

  // Basic navigation menus
  const existingMenus = await db.select().from(navigationMenus).limit(1);
  if (existingMenus.length === 0) {
    const headerItems: NavItem[] = [
      { label: "Home", url: "/", external: false, children: undefined },
      { label: "Articles", url: "/articles", external: false, children: undefined },
      { label: "Events", url: "/events", external: false, children: undefined },
    ];

    const footerItems: NavItem[] = [
      { label: "Privacy", url: "/privacy", external: false, children: undefined },
    ];

    await db.insert(navigationMenus).values([
      {
        location: "HEADER",
        items: headerItems,
      },
      {
        location: "FOOTER",
        items: footerItems,
      },
    ]);
  }
}

main()
  .then(() => {
    console.log("Database seeded successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database", error);
    process.exit(1);
  });
