# Quickstart: Custom CMS for Next.js Website

This guide explains how to run and work on the `001-custom-cms` feature locally.

---

## 1. Prerequisites

- Node.js 20+ installed.
- PostgreSQL instance available for development and testing.
- pnpm (or npm/yarn) installed.
- Access to S3 credentials if testing S3 storage locally (optional; local storage is the default).

---

## 2. Install Dependencies

From the repository root:

```bash
pnpm install
```

> If a different package manager is standard in this repo, use that instead.

Ensure that required libraries from the tech stack are present in `package.json`:
- Next.js 16
- React, React DOM
- Tailwind CSS v4
- Drizzle ORM v0.44.7
- better-auth v1.3.34
- TipTap v3.10.7
- shadcn/ui
- React Hook Form v7.66
- Zod v4.1.12
- dnd-kit
- React Big Calendar
- Sharp
- date-fns
- Testing stack (Jest/Vitest, React Testing Library, Playwright)

If any are missing, add them before starting work.

---

## 3. Environment Configuration

Create a `.env.local` file (or equivalent) with at least:

- `DATABASE_URL` – PostgreSQL connection string.
- `STORAGE_PROVIDER` – `local` (default) or `s3`.
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (when using S3).
- Auth-related secrets required by better-auth (e.g., signing keys, cookie settings).
- Any application-specific base URLs (e.g., `NEXT_PUBLIC_SITE_URL`).

Refer to the auth and storage modules under `lib/auth` and `lib/storage` once implemented for exact variable names.

---

## 4. Database Setup

1. Generate and run Drizzle migrations once the schema is defined in `db/schema.ts`:

   ```bash
   # Example; adjust to actual Drizzle CLI usage in this repo
   pnpm drizzle:generate
   pnpm drizzle:migrate
   ```

2. Seed development data:

   ```bash
   pnpm db:seed
   ```

   The `db/seed.ts` script should create:
   - At least one Admin user.
   - Example categories, offices, and persons.
   - A few articles, events, promotions, and media records.

---

## 5. Running the App

From the repository root:

```bash
pnpm dev
```

Then visit:

- `http://localhost:3000/admin` – CMS dashboard (login required).
- `http://localhost:3000/` – Public homepage with active promotions.
- `http://localhost:3000/articles` – Public article listing with search and pagination.
- `http://localhost:3000/articles/[slug]` – Public article detail page.
- `http://localhost:3000/events` – Public events listing with list/calendar toggle and filters.
- `http://localhost:3000/events/[slug]` – Public event detail page.

All public routes are implemented under `app/(public)` but are exposed without the `(public)` segment in the URL.

---

## 6. Working on the Feature

When implementing this feature, follow this order:

1. **Database & Schema**
   - Implement the entities from `data-model.md` in `db/schema.ts`.
   - Generate and run migrations.

2. **Auth & Permissions**
   - Configure better-auth in `lib/auth/auth-config.ts`.
   - Implement role-based helpers in `lib/auth/permissions.ts`.
   - Protect `/app/admin` routes based on roles.

3. **Core Services**
   - Implement business logic in `lib/services/*` for articles, events, promotions, media, persons, and settings.
   - Keep Server Actions thin by delegating to these services.

4. **Admin UI**
   - Build `/app/admin` pages using shadcn/ui, Tailwind, TipTap, React Hook Form, and Zod.
   - Integrate media picker, image editor, calendar, and menu builder components.

5. **Public UI**
   - Implement `(public)` pages for articles, events, and promotions.
   - Use SSR and `next/image` for optimized rendering and images.

6. **Scheduling & Activity Logging**
   - Implement scheduled publishing logic (job or scheduled route).
   - Implement ActivityLog writes in service layer and show recent activity on the dashboard.

7. **Preview Flow**
   - Implement preview tokens and `/preview/[token]` route.
   - Ensure draft content is only visible via preview and to authorized users.

8. **Testing & Hardening**
   - Add unit, integration, and E2E tests for the critical flows outlined above.
   - Run linting and type checks; fix issues before commits.

---

## 7. Color Scheme & UI

The CMS and public site should use the provided color palette:

- Primary background: `#F7F3E9` (Cream)
- Secondary light: `#FAF7F1`
- Primary text / header background: `#1A1A1A`
- Soft text accent: `#6C6657`
- Primary accent: `#C8A351` (Gold)
- Accent depth / hover: `#A7893F`

Apply this consistently via Tailwind config and shadcn/ui theme tokens.

---

## 8. Next Steps

Once this quickstart is followed and the basic CMS is running:

- Use `/speckit.tasks` to break the plan into implementable tasks.
- Implement tasks in small PRs, ensuring tests and linting pass.
- Keep `plan.md`, `data-model.md`, and this quickstart up to date if significant design changes are made.
