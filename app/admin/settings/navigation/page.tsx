import {
  getNavigationMenuByLocation,
  listNavigationMenus,
  type NavItem,
} from "@/lib/services/settings-service";
import { MenuBuilder } from "@/components/admin/menu-builder";
import { updateNavigationMenuAction } from "./actions";

interface AdminNavigationSettingsPageProps {
  searchParams?: {
    location?: string;
  };
}

function parseLocationParam(raw: string | undefined): "HEADER" | "FOOTER" {
  if (raw === "FOOTER") return "FOOTER";
  return "HEADER";
}

export default async function AdminNavigationSettingsPage({ searchParams }: AdminNavigationSettingsPageProps) {
  const location = parseLocationParam(searchParams?.location);

  const [menus] = await Promise.all([listNavigationMenus()]);
  const currentMenu = await getNavigationMenuByLocation(location);

  const items = (currentMenu?.items as NavItem[] | null | undefined) ?? [];

  const headerMenuExists = menus.some((m) => m.location === "HEADER");
  const footerMenuExists = menus.some((m) => m.location === "FOOTER");

  return (
    <section className="space-y-6 max-w-4xl">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Navigation</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage navigation menus for the public site header and footer.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-[var(--color-muted-foreground)]">Editing menu:</span>
        <a
          href="/admin/settings/navigation?location=HEADER"
          className={`rounded-md border px-3 py-1.5 ${
            location === "HEADER"
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/10"
          }`}
        >
          Header menu
        </a>
        <a
          href="/admin/settings/navigation?location=FOOTER"
          className={`rounded-md border px-3 py-1.5 ${
            location === "FOOTER"
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/10"
          }`}
        >
          Footer menu
        </a>
      </div>

      <form
        action={updateNavigationMenuAction}
        method="post"
        className="space-y-4 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm"
      >
        <input type="hidden" name="location" value={location} />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">
              {location === "HEADER" ? "Header menu" : "Footer menu"}
            </h2>
            <p className="text-[0.7rem] text-[var(--color-muted-foreground)]">
              Drag items to reorder. External links will open in a new tab.
            </p>
          </div>

          <MenuBuilder name="items" initialItems={items} />
        </div>

        <div className="flex items-center justify-between gap-2 text-[0.7rem] text-[var(--color-muted-foreground)]">
          <div className="space-y-0.5">
            <p>Existing menus:</p>
            <ul className="list-disc pl-4">
              <li className={!headerMenuExists ? "opacity-60" : ""}>
                Header menu {headerMenuExists ? "configured" : "(not yet configured)"}
              </li>
              <li className={!footerMenuExists ? "opacity-60" : ""}>
                Footer menu {footerMenuExists ? "configured" : "(not yet configured)"}
              </li>
            </ul>
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
          >
            Save menu
          </button>
        </div>
      </form>
    </section>
  );
}

