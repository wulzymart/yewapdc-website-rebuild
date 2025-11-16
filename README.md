## YEWAPDC Website CMS

This repository contains a custom content management system (CMS) and public site for the Yewa People\'s Development Council, built on the [Next.js](https://nextjs.org) App Router with a PostgreSQL backend and Drizzle ORM.

Admins can manage articles, events, promotions, media, persons/offices, and global site configuration (settings and navigation), while visitors see a public-facing site with articles, events, and promotion banners.

## Getting Started

First, install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Key URLs

- `/admin` – CMS dashboard (login required).
- `/articles` – Public article listing and search.
- `/articles/[slug]` – Public article detail.
- `/events` – Public events listing with list/calendar toggle and filters.
- `/events/[slug]` – Public event detail.

Admin pages are available under `/admin/*` for articles, events, promotions, media, persons, offices, and settings.

### Tests

This project includes unit, integration, and E2E tests.

- **Integration tests** (services and workflows):

  ```bash
  pnpm test -- tests/integration
  ```

- **Playwright E2E tests** (core CMS flows):

  ```bash
  pnpm playwright test
  ```

Make sure `DATABASE_URL` points to a test database when running integration and E2E tests.

### Further Docs

See `specs/001-custom-cms/quickstart.md` and `specs/001-custom-cms/tasks.md` for a detailed breakdown of phases, tasks, and architecture.
## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). For production, ensure environment variables (database, auth, storage) are configured as described in the quickstart.
