# Data Model: Admin UI Refresh Dashboard

This feature does **not** introduce new persisted entities. Instead, it defines view‑models derived from existing tables (`articles`, `events`, `promotions`, `media`).

## DashboardSummary

Represents the full payload needed to render the `/admin` dashboard.

- `metrics: DashboardMetric[]` – high‑level counts per entity type.
- `articlesChart: ArticlesChartSeries` – 14‑day series for published articles.
- `upcoming: UpcomingItem[]` – upcoming events and/or active promotions.
- `activity: DashboardActivity[]` – recent content changes.

## DashboardMetric

Represents a single metric tile.

- `id: string` – stable identifier (e.g., `"articles"`, `"events"`).
- `label: string` – human‑readable label.
- `value: number` – primary numeric value (e.g., count).
- `delta?: number` – optional numeric delta vs previous period.
- `trend?: "up" | "down" | "flat"` – optional trend direction.
- `href?: string` – optional link target for “View all / View report”.

## ArticlesChartSeries

Represents the main chart for published articles per day over the last 14 days.

- `points: ArticlesChartPoint[]` – ordered from oldest to newest.

### ArticlesChartPoint

- `date: string` – date label (e.g., `"2025-11-01"`).
- `count: number` – number of articles published on that date.

## UpcomingItem

Represents an upcoming time‑based item to show in a schedule widget.

- `id: string` – underlying entity ID.
- `type: "event" | "promotion"` – type of upcoming item.
- `title: string` – display title.
- `start: Date` – start datetime.
- `end?: Date` – optional end datetime.
- `href: string` – link to the admin detail or list view.

## DashboardActivity

Represents a recent content change.

- `id: string` – underlying entity ID.
- `type: "article" | "event" | "promotion" | "media"` – entity type.
- `title: string` – content title or filename.
- `action: "created" | "updated"` – type of change.
- `at: Date` – timestamp of the change.
- `actor?: string` – optional actor label (e.g., author/editor name or email).
- `href: string` – link to the admin edit or detail view.

## Role Scoping

Role‑aware behaviour is applied when building `DashboardSummary`:

- Admin/editor: metrics and chart computed from all content.
- Author: metrics and chart filtered to content created by that author.

No additional DB tables or migrations are required for this feature.
