# Tasks: Admin UI Refresh Dashboard

**Feature**: `002-admin-ui-refresh`  
**Spec**: `specs/002-admin-ui-refresh/spec.md`  
**Plan**: `specs/002-admin-ui-refresh/plan.md`

All tasks use the checklist format:

```text
- [ ] T001 [P] [US1] Description with file path
```

---

## Phase 1 – Setup

- [x] T001 Verify shadcn/ui and @heroicons/react dependencies and config in `package.json`, `components.json`, and Tailwind config, updating them if needed to support new admin components.
- [x] T002 [P] Create `specs/002-admin-ui-refresh/research.md` summarising shadcn/ui and Heroicons usage decisions, dashboard layout patterns, and colour‑scheme constraints.
- [x] T003 [P] Create `specs/002-admin-ui-refresh/data-model.md` describing dashboard view‑models (metric cards, chart series, upcoming items, activity entries) and their fields.
- [x] T004 [P] Create `specs/002-admin-ui-refresh/quickstart.md` explaining how to run the app, access `/admin`, and manually verify the refreshed dashboard UI.

---

## Phase 2 – Foundational (Shared Services)

- [x] T005 Implement a `lib/services/dashboard-service.ts` helper that aggregates global and per‑author metrics (counts, 14‑day published‑articles series, upcoming events/promotions, recent activity) using existing `article-service`, `event-service`, `promotion-service`, and `media-service` modules.
- [x] T006 [P] Add integration tests in `tests/integration/dashboard.test.ts` to verify that `dashboard-service` returns correct counts and 14‑day series values for a seeded dataset.

---

## Phase 3 – User Story 1 (US1): View site status at a glance

Goal: Admins and editors see key site status (metrics, upcoming items, recent activity) immediately on `/admin`.

- [x] T007 [US1] Replace the placeholder dashboard in `app/admin/page.tsx` with a server component that calls `dashboard-service` and renders a dashboard-style layout using shadcn/ui primitives (e.g., container/stack) while preserving the existing colour scheme.
- [x] T008 [P] [US1] Implement `components/admin/dashboard-metrics.tsx` to render summary metric cards (articles, events, promotions, media) using shadcn/ui Card components and Heroicons, with labels, primary values, and optional trend indicators.
- [x] T009 [P] [US1] Implement `components/admin/dashboard-activity.tsx` to show a list of recent content changes (created/updated articles, events, promotions) with links into the relevant admin pages.
- [x] T010 [US1] Wire role-aware metric scoping in `dashboard-service.ts` and `app/admin/page.tsx` so ADMIN/EDITOR see global metrics while AUTHOR sees only metrics for their own content.

---

## Phase 4 – User Story 2 (US2): Navigate admin sections efficiently

Goal: Provide a modernised admin layout with persistent sidebar and top header for fast navigation between sections.

- [x] T011 [US2] Refine `app/admin/layout.tsx` to ensure a clear three-part structure (sidebar, header, main content) using shadcn/ui layout primitives while maintaining existing accessibility features (skip link, aria labels) and colour palette.
- [x] T012 [P] [US2] Implement or extract `components/admin/admin-nav.tsx` for the sidebar navigation, using Heroicons (or coloured icons) and clear grouping for Dashboard, Articles, Events, Promotions, Media, Persons, Offices, Settings, and Users (where applicable).
- [x] T013 [US2] Enhance the top header area in `app/admin/layout.tsx` to include site branding, an optional search/quick‑action area, and a user menu, styled with shadcn/ui components.
- [x] T014 [US2] Ensure selected nav item highlighting and consistent layout across all admin pages (Articles, Events, Promotions, Media, Persons, Offices, Settings) by verifying visual state and routing behaviour in `app/admin/layout.tsx` and `components/admin/admin-nav.tsx`.

---

## Phase 5 – User Story 3 (US3): Use dashboard widgets for deeper insights

Goal: Add chart and widget components that provide visual trends and quick links into detailed admin lists.

- [x] T015 [US3] Implement `components/admin/dashboard-chart.tsx` to render the "published articles per day over the last 14 days" chart using CSS/SVG (or lightweight primitives) with colours aligned to the existing palette.
- [x] T016 [P] [US3] Implement a widget (e.g., `components/admin/dashboard-schedule.tsx`) that summarises upcoming events and/or active promotions (counts and short list) and surface it on `app/admin/page.tsx` with links to the corresponding admin sections.
- [x] T017 [P] [US3] Add "View all" / "View report" actions to metric cards and widgets in `components/admin/dashboard-metrics.tsx`, `components/admin/dashboard-chart.tsx`, and `components/admin/dashboard-schedule.tsx`, routing to the appropriate admin list pages.

---

## Phase 6 – Polish & Cross-Cutting Concerns

- [x] T018 Audit responsive behaviour of the admin layout and dashboard components in `app/admin/layout.tsx` and `components/admin/*` to ensure usability on narrower viewports (e.g., stacking, sidebar collapse, scroll behaviour).
- [x] T019 [P] Extend `tests/e2e/cms-flows.spec.ts` to cover the new dashboard: verify that `/admin` shows metric cards, the 14‑day chart, upcoming widget, and that sidebar navigation works as expected.
- [x] T020 [P] Update documentation in `specs/002-admin-ui-refresh/quickstart.md` (and, if useful, the root `README.md`) with a short description and, optionally, screenshots of the refreshed admin dashboard and navigation.

---

## Dependencies & Story Order

1. **Phase 1 – Setup** must complete before foundational work.
2. **Phase 2 – Foundational** (`dashboard-service` and tests) should complete before wiring `/admin` and widgets.
3. **Phase 3 – US1** (core dashboard metrics and layout) is the primary MVP slice.
4. **Phase 4 – US2** (navigation layout) can proceed in parallel with US1 once the layout contract is agreed.
5. **Phase 5 – US3** (chart + widgets) depends on foundational metrics and basic dashboard scaffolding.
6. **Phase 6 – Polish** runs after the main stories are implemented.

## Parallel Execution Examples

- T002, T003, and T004 can be done in parallel once T001 has confirmed library setup.
- T005 and T011 can be implemented in parallel (service vs layout) as long as the interface between them is sketched early.
- T008, T009, T012, T016, and T017 are all UI components that can be worked on in parallel once `dashboard-service` and the layout structure are available.
- T019 and T020 can run in parallel after the dashboard UI is largely complete.

## Implementation Strategy

- **MVP (US1)**: Implement T001–T010 to deliver a functional dashboard at `/admin` with metric cards, upcoming items, and recent activity, using shadcn/ui and Heroicons within the existing colour scheme.
- **Iteration 2 (US2)**: Complete T011–T014 to refine the admin layout and navigation for efficiency and clarity.
- **Iteration 3 (US3 + Polish)**: Complete T015–T020 to add the 14‑day chart, deeper widgets, responsive tweaks, tests, and documentation.
