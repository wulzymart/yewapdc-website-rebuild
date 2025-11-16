# Research: Admin UI Refresh Dashboard

## Technologies

- **shadcn/ui**
  - Use existing shadcn/ui setup (`components.json`, `components/ui/*`) for layout primitives and cards.
  - Prefer shadcn/ui components for:
    - Page containers/sections (stacked layout, spacing).
    - Card-like metric tiles (Card, CardHeader, CardContent).
    - Buttons/links in the dashboard (e.g., “View all”, “View report”).
  - Respect the existing YEWAPDC colour palette by mapping tokens to Tailwind utility classes and, where needed, shadcn theme tokens.

- **Heroicons (@heroicons/react)**
  - Use outline icons for navigation and metric tiles to match the clean reference design.
  - Apply colours via existing palette classes (e.g., accent, muted, foreground) rather than introducing new brand colours.
  - Use 24x24 outline icons from `@heroicons/react/24/outline` for sidebar and dashboard metrics.

- **Charts**
  - Avoid heavy charting libraries for a single dashboard chart; use:
    - Simple CSS/SVG markup inside `components/admin/dashboard-chart.tsx`.
    - Tailwind utility classes for sizing and colours.
  - Main chart: published articles per day over the last 14 days (time series of counts).

## Layout Patterns

- Sidebar + top header + main content layout similar to the provided reference image.
- Dashboard content organised into:
  - Top row of metric cards.
  - Main area split between a chart and a widget for upcoming items.
  - Lower area with a recent activity list.
- Use consistent spacing and alignment to keep the UI light and elegant.

## Role Behaviour

- Admin and editor users see global metrics across the site.
- Author users see metrics scoped to their own content while still using the same visual layout.

## Testing & Verification

- Extend existing Playwright E2E tests to assert that `/admin` renders:
  - Metric cards.
  - The 14‑day chart.
  - Upcoming items widget.
  - Working sidebar navigation.
- Add a focused integration test for the dashboard service to validate aggregated metrics and chart data.
