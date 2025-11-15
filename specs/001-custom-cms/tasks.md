# Tasks: Custom CMS for Next.js Website

**Input**: Design documents from `specs/001-custom-cms/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: The spec and constitution expect automated tests for critical flows. This task list includes targeted test tasks, but you can expand them as needed.

**Organization**: Tasks are grouped by phase and user story so each story can be implemented and tested independently.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure the repository has the core tooling, dependencies, and visual foundation for the CMS.

- [ ] T001 Verify and add all required CMS dependencies in `package.json` (Next.js 16, Drizzle ORM v0.44.7, better-auth v1.3.34, TipTap v3.10.7, shadcn/ui, React Hook Form v7.66, Zod v4.1.12, dnd-kit, React Big Calendar, Sharp, date-fns, testing stack).
- [ ] T002 [P] Configure Tailwind CSS v4 theme and color palette in `tailwind.config.*` and `app/globals.css` to match the CMS design.
- [ ] T003 [P] Initialize shadcn/ui base setup and utility helpers in `components/ui/*` and `lib/utils/*` (if required by shadcn setup).
- [ ] T004 [P] Ensure TypeScript strict mode and linting are correctly configured in `tsconfig.json` and `eslint.config.mjs` (no `any` leaks, consistent formatting).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story implementation can begin.

**⚠️ CRITICAL**: No user story work should start until this phase is complete.

- [ ] T005 Set up Drizzle client configuration and connection helper in `lib/db/drizzle.ts` using `DATABASE_URL`.
- [ ] T006 Define all CMS entities (Users, Articles, Events, EventImages, Promotions, Media, MediaFolders, MediaTags, Persons, Offices, PersonOffices, Categories, Tags, SiteSettings, NavigationMenus, ActivityLog) in `db/schema.ts` based on `data-model.md`.
- [ ] T007 Generate and run initial Drizzle migrations for the CMS schema in `db/migrations/`.
- [ ] T008 Implement development seed script `db/seed.ts` to create an Admin user, sample categories, offices, persons, articles, events, promotions, and media assets.
- [ ] T009 Configure better-auth in `lib/auth/auth-config.ts` for Next.js App Router with secure cookies and session handling.
- [ ] T010 Implement role-based permission helpers (Admin, Editor, Author, Viewer) in `lib/auth/permissions.ts` (e.g., `canEditArticle`, `canPublish`, `canViewAdmin`).
- [ ] T011 [P] Add environment configuration helper in `lib/utils/env.ts` (or equivalent) to safely read required env vars (DB, storage, auth) with validation.
- [ ] T012 [P] Implement storage adapter interface in `lib/storage/storage-adapter.ts` (upload, delete, getUrl, move, list) with `STORAGE_PROVIDER` switching.
- [ ] T013 [P] Implement local storage backend in `lib/storage/local-storage.ts` for development media handling.
- [ ] T014 [P] Implement S3 storage backend skeleton in `lib/storage/s3-storage.ts` using S3-related env vars.
- [ ] T015 Implement Sharp-based image processing utilities in `lib/utils/image-processor.ts` to generate thumbnails and responsive variants for images.
- [ ] T016 Implement protected admin layout with sidebar navigation and basic shell in `app/admin/layout.tsx`, wired to better-auth and `permissions.ts`.
- [ ] T017 Add admin error boundary and toast notification handling in `app/admin/error.tsx` and shared layout components.
- [ ] T018 [P] Implement public site layout with header/footer placeholders and theme wiring in `app/(public)/layout.tsx`.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 – Manage core site content (Priority: P1) 

**Goal**: Admins and Editors can create, edit, schedule, and publish news articles, blog posts, events, and time-bound promotions with rich media and SEO metadata.

**Independent Test**: An Editor can create a new article, related event, and a time-bound promotion, schedule them for future publication, and see them appear and expire correctly on the public site without developer intervention.

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implement article business logic (CRUD, slugging, scheduling, SEO fields) in `lib/services/article-service.ts` using Drizzle models.
- [ ] T020 [P] [US1] Implement event business logic (CRUD, list by date/category, calendar-transform) in `lib/services/event-service.ts`.
- [ ] T021 [P] [US1] Implement promotion business logic (CRUD, active filter by date, priority ordering, position) in `lib/services/promotion-service.ts`.
- [ ] T022 [US1] Implement article Server Actions (create, update, delete, schedule) in `app/admin/articles/actions.ts` delegating to `article-service.ts` and `permissions.ts`.
- [ ] T023 [US1] Implement event Server Actions (create, update, publish/unpublish) in `app/admin/events/actions.ts` delegating to `event-service.ts`.
- [ ] T024 [US1] Implement promotion Server Actions (create, update, delete) in `app/admin/promotions/actions.ts` delegating to `promotion-service.ts`.
- [ ] T025 [US1] Build article list page in `app/admin/articles/page.tsx` with filters (status, category) and actions (edit, delete, schedule) using shadcn/ui table components.
- [ ] T026 [US1] Build article create page in `app/admin/articles/new/page.tsx` with TipTap editor, media picker for featured/OG images, SEO fields, and status/schedule controls.
- [ ] T027 [US1] Build article edit page in `app/admin/articles/[id]/edit/page.tsx` reusing the editor form and Server Actions for updates.
- [ ] T028 [US1] Build events list page in `app/admin/events/page.tsx` with table view, filters (date range, category), and a toggle to calendar view.
- [ ] T029 [US1] Build event create page in `app/admin/events/new/page.tsx` with rich description (TipTap), date/time pickers, location, category, and gallery media picker.
- [ ] T030 [US1] Build event edit page in `app/admin/events/[id]/edit/page.tsx` with gallery management and status controls.
- [ ] T031 [US1] Implement `components/admin/calendar-view.tsx` using React Big Calendar + date-fns to render events in month/week/day views for admin.
- [ ] T032 [US1] Build promotions admin pages in `app/admin/promotions/page.tsx`, `app/admin/promotions/new/page.tsx`, and `app/admin/promotions/[id]/edit/page.tsx` with fields for content, media, CTA, date range, position, and priority.
- [ ] T033 [US1] Implement `components/public/article-card.tsx` and public article listing page in `app/(public)/articles/page.tsx` (paging, category filtering, SEO-friendly URLs).
- [ ] T034 [US1] Implement article detail page in `app/(public)/articles/[slug]/page.tsx` rendering TipTap content safely, featured image, and SEO metadata.
- [ ] T035 [US1] Implement events listing page with calendar in `app/(public)/events/page.tsx` using `calendar-view` for public users and filters by category/date.
- [ ] T036 [US1] Implement event detail page in `app/(public)/events/[slug]/page.tsx` showing description, gallery, location, and optional external registration link.
- [ ] T037 [US1] Implement `components/public/promotion-banner.tsx` and integrate it into `app/(public)/page.tsx` to display active promotions by position and priority.
- [ ] T038 [US1] Implement scheduled publishing job endpoint in `app/api/jobs/publish-scheduled/route.ts` (or equivalent) that promotes scheduled articles/events/promotions to published based on time and status.
- [ ] T039 [P] [US1] Add integration tests for article lifecycle (create, schedule, publish, unpublish) in `tests/integration/articles.test.ts` using Server Actions.
- [ ] T040 [P] [US1] Add integration tests for promotions filtering, priority ordering, and expiry in `tests/integration/promotions.test.ts`.
- [ ] T041 [P] [US1] Add integration tests for events listing and calendar behavior (date range, category filters) in `tests/integration/events.test.ts`.

**Checkpoint**: User Story 1 is fully functional and independently testable (core CMS value and public content rendering).

---

## Phase 4: User Story 2 – Author workflow with review (Priority: P2)

**Goal**: Authors can create and edit their own content, submit it for review, and Editors/Admins can review and publish it, preserving clear editorial control.

**Independent Test**: An Author can create/edit drafts and submit them for review but cannot publish; an Editor can see a review queue, request changes if needed, and publish or schedule the content.

### Implementation for User Story 2

- [ ] T042 [US2] Extend `db/schema.ts` to support review state for Articles and Events (e.g., add `workflow_state` or `submitted_for_review_at` fields) and update migrations.
- [ ] T043 [US2] Update `lib/services/article-service.ts` and `lib/services/event-service.ts` to enforce review workflow rules (Author: draft + submit; Editor/Admin: review + publish/schedule).
- [ ] T044 [US2] Update article and event list queries in services and admin pages to ensure Authors only see and modify their own items while Editors/Admins can see all.
- [ ] T045 [US2] Implement review queue page in `app/admin/review/page.tsx` listing content pending review with actions to approve (publish/schedule) or send back for changes.
- [ ] T046 [US2] Update article and event admin forms in `app/admin/articles/*` and `app/admin/events/*` to show "Submit for review" for Authors and hide or disable direct publish controls for non-Editors/Admins.
- [ ] T047 [P] [US2] Add integration tests verifying Authors cannot publish, Editors/Admins can, and review queue behavior in `tests/integration/author-workflow.test.ts`.
- [ ] T048 [P] [US2] Add unit tests for `lib/auth/permissions.ts` covering role capabilities for Articles and Events in `tests/unit/permissions.test.ts`.

**Checkpoint**: User Story 1 and User Story 2 both work independently; editorial workflows are enforced by role.

---

## Phase 5: User Story 3 – Manage media, persons, and site configuration (Priority: P3)

**Goal**: Admins can manage the media library (with folders, previews, and basic editing), persons and offices, and global site configuration (settings, navigation, footer, social links).

**Independent Test**: An Admin can upload and organize media, create/update persons and offices, configure navigation/footer/social links, and see these changes reflected consistently on the public site without developer changes.

### Implementation for User Story 3

- [ ] T049 [US3] Implement media business logic (upload, move, delete, search/filter, variants) in `lib/services/media-service.ts` using `storage-adapter` and `image-processor`.
- [ ] T050 [US3] Implement folder tree navigation component for media in `components/admin/folder-tree.tsx` with support for nested folders.
- [ ] T051 [US3] Implement file preview component in `components/admin/file-preview.tsx` supporting images, video, audio, and PDFs.
- [ ] T052 [US3] Implement image editor UI (crop/resize) in `components/admin/image-editor.tsx` integrated with Sharp utilities.
- [ ] T053 [US3] Build media library page in `app/admin/media/page.tsx` showing grid/list views, folder tree, type/date/tag filters, and inline previews.
- [ ] T054 [US3] Build bulk upload page in `app/admin/media/upload/page.tsx` using `hooks/use-media-upload.ts` and validating types/sizes per constitution.
- [ ] T055 [US3] Implement persons and offices domain logic in `lib/services/person-service.ts` (including current vs historical office assignments) using Persons, Offices, and PersonOffices tables.
- [ ] T056 [US3] Build persons admin pages in `app/admin/persons/page.tsx`, `app/admin/persons/new/page.tsx`, and `app/admin/persons/[id]/edit/page.tsx` with photo picker and office assignments.
- [ ] T057 [US3] Implement office selector component for person assignments in `components/admin/office-selector.tsx` (multi-select with titles and date ranges).
- [ ] T058 [US3] Build offices admin page in `app/admin/offices/page.tsx` to manage office definitions and display order.
- [ ] T059 [US3] Implement settings and navigation services in `lib/services/settings-service.ts` to manage `SiteSettings` and `NavigationMenus` entities.
- [ ] T060 [US3] Build site settings admin page in `app/admin/settings/page.tsx` for site name, description, contact info, and social media links.
- [ ] T061 [US3] Implement drag-and-drop navigation menu builder in `components/admin/menu-builder.tsx` using dnd-kit to edit `NavigationMenus.items`.
- [ ] T062 [US3] Build navigation admin page in `app/admin/settings/navigation/page.tsx` integrating `menu-builder` and persisting menus via `settings-service.ts`.
- [ ] T063 [US3] Wire public header and footer in `app/(public)/layout.tsx` to render navigation menus and footer content using `NavigationMenus` and `SiteSettings`.
- [ ] T064 [P] [US3] Add integration tests for media library search/filtering and folder navigation in `tests/integration/media.test.ts`.
- [ ] T065 [P] [US3] Add integration tests for navigation and settings (updating menus/site settings and verifying public header/footer) in `tests/integration/settings-navigation.test.ts`.

**Checkpoint**: All three user stories are independently functional and testable; admins can manage media, organisational information, and site configuration.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that cut across user stories and ensure production readiness.

- [ ] T066 [P] Update documentation in `README.md` and `specs/001-custom-cms/quickstart.md` to reflect final CMS behavior and workflows.
- [ ] T067 Perform accessibility audit and fixes across admin and public components (`components/admin/*`, `components/public/*`, `app/admin/*`, `app/(public)/*`) to meet WCAG 2.1 AA.
- [ ] T068 [P] Add performance optimizations and caching for public pages (`app/(public)/*`) including `next/image`, revalidation strategies, and any optional cache layer configuration.
- [ ] T069 [P] Implement Playwright E2E tests for core CMS flows (login, create+publish article, events calendar, promotions display, media upload) in `tests/e2e/cms-flows.spec.ts`.
- [ ] T070 Run full QA pass following `quickstart.md` and this task list, fix defects, and ensure all tests/linting/type checks pass before marking the feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 – Setup**: No dependencies; must be completed before heavy implementation.
- **Phase 2 – Foundational**: Depends on Phase 1 and **blocks all user stories**; complete before starting US1–US3.
- **Phase 3 – User Story 1 (P1)**: Depends on Phase 2; can start once foundational infrastructure is in place.
- **Phase 4 – User Story 2 (P2)**: Depends on Phase 2; may also build on User Story 1 services and pages but must remain independently testable.
- **Phase 5 – User Story 3 (P3)**: Depends on Phase 2; may integrate with US1 (media usage in articles/events/promos) but is designed to be independently testable.
- **Phase 6 – Polish**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (Manage core site content)**: First functional story (MVP). No dependency on other user stories once foundation is done.
- **US2 (Author workflow with review)**: Builds on the existence of article/event entities and admin UIs from US1 but adds workflow logic and views; can be tested independently with seeded content.
- **US3 (Manage media, persons, site configuration)**: Depends on foundational schema and services; integrates with US1 for content media usage and public navigation but can be validated on its own.

### Parallel Opportunities

- Tasks marked **[P]** can be safely run in parallel when different files and no direct dependency conflicts exist (e.g., separate services, components, tests).
- After Phase 2 completes, teams can work on US1, US2, and US3 in parallel, respecting dependencies on shared files.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (User Story 1 – core content + public rendering + scheduling).
4. Validate US1 end-to-end with integration tests (T039–T041) and manual checks.
5. Optionally deploy/demo US1 as an MVP.

### Incremental Delivery

1. **Iteration 1**: Phases 1–3 (Setup, Foundation, US1) → deliver full content management and public site.
2. **Iteration 2**: Phase 4 (US2) → add author/review workflow without breaking US1.
3. **Iteration 3**: Phase 5 (US3) → add media library, persons/offices, site configuration.
4. **Iteration 4**: Phase 6 (Polish) → accessibility, performance, E2E tests, documentation.

### Parallel Team Strategy

With multiple developers:

- Developer A: Focus on DB schema, Drizzle, and services (Phases 2, and service-related tasks in Phases 3–5).
- Developer B: Focus on admin UI (`app/admin/*`, `components/admin/*`) across US1–US3.
- Developer C: Focus on public UI (`app/(public)/*`, `components/public/*`) and preview/scheduling flows.
- Developer D (optional): Focus on tests (`tests/*`), performance, and accessibility.

Each developer should pick tasks with **distinct file paths** and favor tasks marked [P] to maximize safe parallel work.
