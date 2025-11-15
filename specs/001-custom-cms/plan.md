# Implementation Plan: Custom CMS for Next.js Website

**Branch**: `001-custom-cms` | **Date**: 2025-11-15 | **Spec**: `specs/001-custom-cms/spec.md`
**Input**: Feature specification from `specs/001-custom-cms/spec.md` plus architecture and schema details from the planning brief.

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a custom, role-based CMS for the YEWAPDC Next.js website that allows admins and editors to manage articles, events, promotions, media, persons, offices, and site configuration from a unified admin area (`/app/admin`). Public-facing pages under `/app/(public)` render SSR content backed by PostgreSQL via Drizzle ORM, with media served from a configurable storage backend (local or S3). Mutations are implemented as Next.js Server Actions; API routes are reserved for external integrations and preview tokens only.

The implementation emphasizes security, data integrity, and usability: better-auth for authentication, strict RBAC, TipTap-based rich text editing, a robust media library with basic image editing, and dashboards that surface scheduled content and activity, all within the constraints and budgets defined by the project constitution.

## Technical Context

**Language/Version**: TypeScript (strict) with React and Next.js 16 (App Router, React Server Components).  
**Primary Dependencies**: Next.js, React, Tailwind CSS v4, Drizzle ORM v0.44.7, better-auth v1.3.34, TipTap v3.10.7, shadcn/ui, React Hook Form v7.66, Zod v4.1.12, dnd-kit, React Big Calendar (preferred) or FullCalendar, Sharp, date-fns.  
**Storage**: PostgreSQL as primary database (via Drizzle ORM); media stored via a storage adapter abstraction targeting local filesystem in development and S3 in production (Supabase-compatible in future if needed).  
**Testing**: Jest or Vitest + React Testing Library for unit/integration tests; Playwright for end-to-end tests on critical CMS flows (login, create/publish content, scheduling). Final framework choice can be validated during setup but MUST satisfy constitution testing requirements.  
**Target Platform**: Single Next.js app deployed to a Node.js 20+ environment, using the Edge runtime where safe for read-heavy paths (public listing/detail pages, some dashboards), with Node.js runtime retained where required (Sharp, certain storage operations).  
**Project Type**: Web application (public marketing/information site plus internal CMS) in a single Next.js repository.  
**Performance Goals**: Align with constitution: initial page load under ~3s on typical network, interactive under ~5s; public content list/detail SSR responses p95 < 300ms under expected load; admin interactions feel instant (client-side navigation, minimal blocking).  
**Constraints**: 
- Internal mutations implemented as Server Actions (no public REST API for admin CRUD).  
- API routes limited to preview tokens and future external webhooks/integrations.  
- RBAC enforced on the server for all protected resources.  
- All DB access goes through Drizzle ORM with migrations and constraints.  
- Media handled through the storage adapter; direct video uploads limited in size with no transcoding.  
**Scale/Scope**: Single-tenant organisation site with tens of admin users and viewers, hundreds to low tens of thousands of content items (articles, events, promotions, media assets), and moderate public traffic; design should remain maintainable if usage grows further.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Security First**  
  - Auth handled by better-auth with secure cookies.  
  - RBAC enforced server-side using role-aware permission helpers.  
  - All forms and Server Actions validated with Zod; file uploads constrained by type and size per constitution (images ≤10MB, videos ≤50MB).  
  - Rich text rendered through a sanitization pipeline to prevent XSS.  
  - File storage isolated from executable code; public URLs avoid leaking internal paths.  

- **Code Quality & Maintainability**  
  - TypeScript `strict` enabled; shared utilities and hooks in `/lib` and `/hooks`.  
  - Clear separation between admin (`/app/admin`) and public (`/app/(public)`) routes.  
  - Business logic encapsulated in `/lib/services/*` and shared across Server Actions and any API routes.  

- **Data Integrity & Persistence**  
  - All tables modeled with Drizzle ORM and backed by PostgreSQL with foreign keys and unique indexes (including slugs).  
  - Audit fields (`created_at`, `updated_at`, `created_by`, `updated_by`) present for all core domain tables; ActivityLog uses `user_id` + `created_at` as the audit trail, which is acceptable given its role as the audit system itself.  
  - Versioned, reversible migrations maintained under `/db/migrations`.  

- **Reliability, Performance & Accessibility**  
  - Use SSR and RSC to minimize client bundle size; Next.js `Image` for all non-trivial images.  
  - Caching and revalidation for public lists (articles, events, promotions), with optional Redis layer if needed.  
  - UI built with shadcn/ui and Tailwind with WCAG 2.1 AA targets, keyboard navigation, and alt-text requirements.  

- **Testing, Content & API Discipline**  
  - Critical flows (auth, content CRUD, scheduling, promotions, media upload) covered by automated tests.  
  - Content rules (slugs, visibility, scheduled publishing) encoded in Drizzle schema and Zod validators.  
  - API routes (for preview and external hooks) follow the standard response envelope and validation rules from the constitution.

**Gate Result**: PASS — plan is compatible with the constitution; no fundamental violations identified at this stage.

## Project Structure

### Documentation (this feature)

```text
specs/001-custom-cms/
├── plan.md              # Implementation plan (/speckit.plan output)
├── research.md          # Phase 0 research & decisions
├── data-model.md        # Phase 1 data model extraction
├── quickstart.md        # How to run and work on this feature
├── contracts/           # API/server action contracts for external integrations & preview
├── checklists/          # Specification quality checklist(s)
└── tasks.md             # Phase 2 task breakdown (/speckit.tasks output)
```

### Source Code (repository root)

```text
app/
  admin/                     # CMS routes (protected)
    layout.tsx               # Admin layout with sidebar navigation
    page.tsx                 # Dashboard (stats, calendar, activity)
    articles/
      page.tsx               # List articles
      new/page.tsx           # Create article
      [id]/edit/page.tsx     # Edit article
    events/
      page.tsx               # List events with calendar view toggle
      new/page.tsx           # Create event
      [id]/edit/page.tsx     # Edit event
    promotions/
      page.tsx               # List promotions
      new/page.tsx           # Create promotion
      [id]/edit/page.tsx     # Edit promotion
    media/
      page.tsx               # Media library with folder tree
      upload/page.tsx        # Bulk upload interface
    persons/
      page.tsx               # List persons
      new/page.tsx           # Create person
      [id]/edit/page.tsx     # Edit person
    offices/
      page.tsx               # Manage offices
    settings/
      page.tsx               # Site settings (global, footer, social)
      navigation/page.tsx    # Navigation menu builder (drag-and-drop)
      users/page.tsx         # User management (admin only)

  api/
    webhooks/                # External webhooks (future integrations)
      route.ts               # Placeholder router for external events

  (public)/                  # Public-facing website
    page.tsx                 # Homepage with active promotions
    articles/
      page.tsx               # Articles listing
      [slug]/page.tsx        # Article detail
    events/
      page.tsx               # Events listing with calendar
      [slug]/page.tsx        # Event detail
    preview/
      [token]/page.tsx       # Draft preview via token

components/
  ui/                        # shadcn/ui components
  admin/
    rich-text-editor.tsx     # TipTap editor wrapper
    media-picker.tsx         # Media selection modal
    image-editor.tsx         # Image crop/resize UI
    file-preview.tsx         # PDF/image/video/audio preview
    folder-tree.tsx          # File tree navigation
    calendar-view.tsx        # Calendar component for events
    menu-builder.tsx         # Drag-and-drop menu builder
    category-select.tsx      # Category dropdown
    person-selector.tsx      # Multi-select for persons
    office-selector.tsx      # Office assignment UI
  public/
    promotion-banner.tsx     # Display active promotions
    event-card.tsx           # Event display component
    article-card.tsx         # Article preview card

lib/
  auth/
    auth-config.ts           # better-auth configuration and helpers
    permissions.ts           # Role-based permission helpers
  storage/
    storage-adapter.ts       # Abstract storage interface
    local-storage.ts         # Local filesystem implementation
    s3-storage.ts            # S3 implementation
    supabase-storage.ts      # Supabase-compatible implementation (optional/future)
  db/
    drizzle.ts               # Drizzle client setup
  services/
    article-service.ts       # Article business logic
    event-service.ts         # Event business logic
    promotion-service.ts     # Promotion logic
    media-service.ts         # Media upload, processing, storage
    person-service.ts        # Persons & offices logic
  utils/
    slug.ts                  # Slug generation & normalization
    image-processor.ts       # Sharp-based image processing helpers
    validators.ts            # Zod schemas shared by forms & server actions
  hooks/
    use-media-upload.ts      # Media upload & progress handling
    use-preview.ts           # Draft preview link management

db/
  schema.ts                  # Drizzle schema for all entities
  migrations/                # Versioned migration files
  seed.ts                    # Seed data for dev/test

tests/
  unit/                      # Unit tests (utils, services, hooks)
  integration/               # Server actions + DB interaction tests
  e2e/                       # Playwright tests for core CMS flows
```

**Structure Decision**: Single Next.js application using the App Router and React Server Components, with a dedicated `/admin` segment for CMS functionality and a `(public)` segment for the public site. Shared logic is centralized under `/lib`, persistence under `/db`, and reusable UI components under `/components`. This keeps the repository flat and maintainable while matching the desired route and component structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

At this time, no explicit constitution violations are anticipated. If future implementation details introduce exceptions (e.g., additional services or non-ORM DB access), they MUST be documented here before merging.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
|           |            |                                       |
