# Quickstart: Admin UI Refresh Dashboard

## 1. Prerequisites

- Node.js and pnpm installed.
- A PostgreSQL database configured via `DATABASE_URL` in `.env.local`.
- Seeded content (articles, events, promotions) is helpful to see dashboard metrics.

## 2. Install Dependencies

From the repository root:

```bash
pnpm install
# If not already installed:
pnpm add @heroicons/react
```

## 3. Run the App

```bash
pnpm dev
```

Then visit:

- `http://localhost:3000/login` – Log in as an admin/editor user (or create one via `/dev-signup` in development/test).
- `http://localhost:3000/admin` – View the refreshed admin dashboard.

## 4. What to Expect on `/admin`

- A dashboard layout with:
  - Metric cards for articles, events, promotions, and media.
  - A 14‑day chart showing published articles per day.
  - A widget for upcoming events/promotions.
  - A recent activity list linking into admin detail pages.
- Navigation sidebar and top header styled with shadcn/ui components and Heroicons, respecting the existing colour scheme.

## 5. Testing the Dashboard

- **Integration tests**: Run dashboard service tests (once added) via:

  ```bash
  pnpm test -- tests/integration/dashboard.test.ts
  ```

- **E2E tests**: Extend and run Playwright tests to assert that `/admin` renders metrics, chart, widgets, and navigation:

  ```bash
  pnpm playwright
  ```

## 6. Rolling Out

- Merge the `002-admin-ui-refresh` branch after all tests pass.
- Optionally update the root `README.md` with a short section and screenshots of the refreshed admin dashboard.
