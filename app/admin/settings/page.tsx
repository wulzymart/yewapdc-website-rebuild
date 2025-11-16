import { listSettings } from "@/lib/services/settings-service";
import { updateSiteSettingsAction } from "./actions";

function getSettingValue(records: Awaited<ReturnType<typeof listSettings>>, key: string): string {
  const record = records.find((setting) => setting.key === key);
  return record?.value ?? "";
}

export default async function AdminSettingsPage() {
  const settings = await listSettings();

  const siteName = getSettingValue(settings, "site.name");
  const siteTagline = getSettingValue(settings, "site.tagline");
  const siteContactEmail = getSettingValue(settings, "site.contact.email");
  const siteContactPhone = getSettingValue(settings, "site.contact.phone");
  const siteContactAddress = getSettingValue(settings, "site.contact.address");
  const socialFacebook = getSettingValue(settings, "site.social.facebook");
  const socialTwitter = getSettingValue(settings, "site.social.twitter");
  const socialInstagram = getSettingValue(settings, "site.social.instagram");

  return (
    <section className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Site Settings</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage global site information, contact details, and social media links for the YEWAPDC website.
        </p>
      </div>

      <form
        action={updateSiteSettingsAction}
        method="post"
        className="space-y-6 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="siteName"
              className="text-xs font-medium text-[var(--color-muted-foreground)]"
            >
              Site name
            </label>
            <input
              id="siteName"
              name="siteName"
              type="text"
              defaultValue={siteName}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="siteTagline"
              className="text-xs font-medium text-[var(--color-muted-foreground)]"
            >
              Tagline / description
            </label>
            <input
              id="siteTagline"
              name="siteTagline"
              type="text"
              defaultValue={siteTagline}
              className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Contact information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="siteContactEmail"
                className="text-xs font-medium text-[var(--color-muted-foreground)]"
              >
                Contact email
              </label>
              <input
                id="siteContactEmail"
                name="siteContactEmail"
                type="email"
                defaultValue={siteContactEmail}
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="siteContactPhone"
                className="text-xs font-medium text-[var(--color-muted-foreground)]"
              >
                Phone number
              </label>
              <input
                id="siteContactPhone"
                name="siteContactPhone"
                type="tel"
                defaultValue={siteContactPhone}
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="siteContactAddress"
              className="text-xs font-medium text-[var(--color-muted-foreground)]"
            >
              Postal address
            </label>
            <textarea
              id="siteContactAddress"
              name="siteContactAddress"
              rows={3}
              defaultValue={siteContactAddress}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Social media</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label
                htmlFor="socialFacebook"
                className="text-xs font-medium text-[var(--color-muted-foreground)]"
              >
                Facebook URL
              </label>
              <input
                id="socialFacebook"
                name="socialFacebook"
                type="url"
                defaultValue={socialFacebook}
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="socialTwitter"
                className="text-xs font-medium text-[var(--color-muted-foreground)]"
              >
                Twitter / X URL
              </label>
              <input
                id="socialTwitter"
                name="socialTwitter"
                type="url"
                defaultValue={socialTwitter}
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="socialInstagram"
                className="text-xs font-medium text-[var(--color-muted-foreground)]"
              >
                Instagram URL
              </label>
              <input
                id="socialInstagram"
                name="socialInstagram"
                type="url"
                defaultValue={socialInstagram}
                className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-foreground)]"
          >
            Save settings
          </button>
        </div>
      </form>
    </section>
  );
}

