import { describe, it, expect } from "@jest/globals";

import {
  deleteSetting,
  getNavigationMenuByLocation,
  getSetting,
  listNavigationMenus,
  listSettings,
  upsertNavigationMenu,
  upsertSetting,
} from "@/lib/services/settings-service";

describe("settings and navigation integration", () => {
  it("creates, updates, lists, and deletes a site setting", async () => {
    const key = `integration.setting.${Date.now()}`;

    const created = await upsertSetting({
      key,
      value: "initial-value",
      type: "STRING",
      updatedBy: "integration-test",
    });

    expect(created.key).toBe(key);
    expect(created.value).toBe("initial-value");

    const updated = await upsertSetting({
      key,
      value: "updated-value",
      type: "STRING",
      updatedBy: "integration-test-updated",
    });

    expect(updated.id).toBe(created.id);
    expect(updated.value).toBe("updated-value");

    const fetched = await getSetting(key);
    expect(fetched).not.toBeNull();
    expect(fetched?.value).toBe("updated-value");

    const all = await listSettings();
    const fromList = all.find((setting) => setting.key === key);
    expect(fromList).not.toBeUndefined();

    await deleteSetting(updated.id);
    const afterDelete = await getSetting(key);
    expect(afterDelete).toBeNull();
  });

  it("creates and updates navigation menus for header and footer", async () => {
    const header = await upsertNavigationMenu({
      location: "HEADER",
      items: [
        { label: "Home", url: "/" },
        { label: "Articles", url: "/articles" },
      ],
      updatedBy: "integration-test",
    });

    expect(header.location).toBe("HEADER");

    const headerFromLocation = await getNavigationMenuByLocation("HEADER");
    expect(headerFromLocation).not.toBeNull();
    expect((headerFromLocation!.items as unknown[]).length).toBe(2);

    const updatedHeader = await upsertNavigationMenu({
      location: "HEADER",
      items: [{ label: "Home", url: "/" }],
      updatedBy: "integration-test-updated",
    });

    expect(updatedHeader.id).toBe(header.id);

    const headerAfterUpdate = await getNavigationMenuByLocation("HEADER");
    expect(headerAfterUpdate).not.toBeNull();
    expect((headerAfterUpdate!.items as unknown[]).length).toBe(1);

    const footer = await upsertNavigationMenu({
      location: "FOOTER",
      items: [
        { label: "Contact", url: "/contact" },
        { label: "Events", url: "/events" },
      ],
      updatedBy: "integration-test",
    });

    expect(footer.location).toBe("FOOTER");

    const menus = await listNavigationMenus();
    const hasHeader = menus.some((menu) => menu.location === "HEADER");
    const hasFooter = menus.some((menu) => menu.location === "FOOTER");

    expect(hasHeader).toBe(true);
    expect(hasFooter).toBe(true);
  });
});
