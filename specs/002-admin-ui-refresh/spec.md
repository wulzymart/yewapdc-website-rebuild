# Feature Specification: Admin UI Refresh Dashboard

**Feature Branch**: `002-admin-ui-refresh`  
**Created**: 2025-11-16  
**Status**: Draft  
**Input**: User description: "Improve the UI of the CMS admin route while maintaining the colour scheme, change the layout and add dashboard components similar to the provided image. Acceptance: an elegant UI that aligns with the current colour scheme."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - View site status at a glance (Priority: P1)

An admin or editor signs in and lands on a dashboard-style `/admin` home screen that immediately shows key CMS status: content counts (articles, events, promotions, media), recent activity, and upcoming items, arranged in an elegant grid similar to the provided reference UI.

**Why this priority**: The dashboard is the primary entry point for administrators; it must give immediate clarity on the site’s content and state without navigating through multiple lists.

**Independent Test**: Can be fully tested by logging in as an admin/editor and verifying that the dashboard shows metrics and activity without needing to visit any other admin pages.

**Acceptance Scenarios**:

1. **Given** an admin logs into the CMS, **When** they are redirected to `/admin`, **Then** they see a dashboard with at least one section of high-level metrics (e.g., counts of published articles and upcoming events) and a visually balanced layout.
2. **Given** there is recent content activity (created/updated articles, events, promotions), **When** the admin views the dashboard, **Then** they see a summary of recent items (e.g., last N changes) without opening individual list pages.

---

### User Story 2 - Navigate admin sections efficiently (Priority: P2)

An admin, editor, or author uses a modernized admin layout with a persistent sidebar and top header to move between Articles, Events, Promotions, Media, Persons, Offices, and Settings with minimal friction and clear visual hierarchy.

**Why this priority**: Daily CMS work is navigation-heavy. A clearer layout and navigation model reduces cognitive load and time spent finding sections.

**Independent Test**: Can be fully tested by measuring how many clicks and how much time it takes to move between common admin sections using only the new layout and navigation (without relying on browser history or direct URLs).

**Acceptance Scenarios**:

1. **Given** a logged-in admin on the `/admin` dashboard, **When** they use the sidebar navigation to open Articles, Events, Promotions, Media, or Settings, **Then** the selected item is visually highlighted, and the corresponding page content is shown in the main area.
2. **Given** a logged-in admin on any admin page, **When** they use the top header (e.g., logo/title area and user avatar/menu), **Then** they can quickly return to the dashboard and access account-related actions without losing their place.

---

### User Story 3 - Use dashboard widgets for deeper insights (Priority: P3)

An admin views richer dashboard widgets such as charts and ranked lists (e.g., content created over time, most recent or most active content), and can click from these widgets into the relevant detailed admin lists.

**Why this priority**: Visual summaries and quick links reduce time spent scanning long tables and help admins understand trends at a glance.

**Independent Test**: Can be fully tested by verifying that charts and lists appear when there is data, that they respect the existing colour scheme, and that interactions (e.g., clicking a widget) open the expected admin list views.

**Acceptance Scenarios**:

1. **Given** the CMS has published articles and upcoming events, **When** an admin views the dashboard, **Then** they see at least one chart-like widget or summary breakdown (e.g., published this week vs all time, upcoming events in the next 30 days).
2. **Given** a dashboard widget lists recent or top content items, **When** the admin clicks an item or its "View" action, **Then** they are taken to the appropriate admin page (e.g., Articles list or specific article edit view).

---

### Edge Cases

- **No content yet**: When there are no articles, events, promotions, or media, the dashboard widgets should show informative empty states (e.g., "No articles yet") rather than broken charts or zero-value visuals.
- **Limited permissions**: When a user with a restricted role (e.g., AUTHOR) accesses `/admin`, they should see a version of the layout and dashboard that respects their permissions (e.g., metrics and navigation limited to the content they are allowed to manage).
- **Narrow or small screens**: When the viewport is narrow (e.g., tablet or small laptop), the layout should adapt so that navigation and dashboard widgets remain readable and not horizontally clipped.
- **Partial data or errors**: When some metric data cannot be loaded (e.g., temporary DB error for one widget), the rest of the dashboard should still render, and the affected widget should show a non-technical fallback message (e.g., "Unable to load this summary right now").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CMS MUST present an updated dashboard view at `/admin` that surfaces key content metrics (e.g., counts of published articles, events, promotions, and media) in visually distinct cards.
- **FR-002**: The admin layout MUST include a persistent navigation area and a main content area, arranged to support a dashboard-first experience while maintaining the existing colour palette (backgrounds, accents, text colours).
- **FR-003**: The dashboard MUST include at least one section that summarises upcoming time-based content (e.g., upcoming events or active promotions) so an admin can quickly see what is scheduled.
- **FR-004**: Each dashboard metric card or widget MUST clearly indicate its label, primary value (e.g., "24 published articles"), and any relevant trend or comparison where available (e.g., up/down vs last week) without requiring the user to open a separate report.
- **FR-005**: The layout and spacing of dashboard components MUST support readability and visual hierarchy similar in spirit to the provided reference image (e.g., clear grouping of charts, metrics, and lists) while still matching the existing color scheme.
- **FR-006**: The admin navigation MUST allow direct access to all existing admin sections (Articles, Events, Promotions, Media, Persons, Offices, Settings, Users where applicable) from any admin page in one or two clicks.
- **FR-007**: The dashboard MUST provide quick navigation affordances from widgets to the underlying list or detail views (e.g., a "View all" or "View report" action per widget).
- **FR-008**: The dashboard SHOULD include at least one visual chart-style widget; the primary chart MUST show published articles per day over the last 14 days to illustrate recent content activity trends.
- **FR-009**: The dashboard MUST present global, site-wide metrics for ADMIN and EDITOR roles, and author-scoped metrics (only their own contributions) for AUTHOR roles wherever metrics are displayed.
- **FR-010**: The updated admin UI MUST remain accessible, including keyboard navigation, focus states, and clear contrast in line with the existing accessibility improvements.

### Key Entities *(include if feature involves data)*

- **Dashboard Metric**: Represents a single summarised value shown on the dashboard (e.g., "Published articles", "Upcoming events"). Attributes include label, numeric value, optional comparison (e.g., vs last period), and link target.
- **Dashboard Widget**: A composed UI block that groups one or more metrics or visualisations (e.g., a chart of content over time, a list of recent items). Attributes include title, description/legend, associated metrics, and one or more actions (e.g., "View report").
- **User Role View**: Logical mapping between user roles (ADMIN, EDITOR, AUTHOR) and the subset of dashboard widgets and navigation items they can see.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can identify the current count of published articles and upcoming events from the dashboard within 5 seconds of landing on `/admin`, without visiting other pages.
- **SC-002**: In usability checks, at least 80% of admin/editor users report that the updated admin UI is "easy" or "very easy" to navigate compared to the previous layout.
- **SC-003**: Common navigation tasks (e.g., moving from dashboard to Articles, then to Events) require no more than two clicks per transition from the dashboard.
- **SC-004**: The visual design of the updated admin UI is approved in internal review as "elegant" while strictly retaining the existing colour palette values for backgrounds, text, and accents.

## Clarifications

### Session 2025-11-16

- Q: For authors, should dashboard metrics be global or scoped to their own content? → A: Authors see only their own contributions; admins and editors see global metrics.
- Q: What should the primary dashboard chart display? → A: Published articles per day over the last 14 days.
