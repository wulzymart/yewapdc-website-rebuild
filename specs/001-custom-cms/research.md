# Research & Decisions: Custom CMS for Next.js Website

## Overview

This document captures key technical decisions and rationale for the custom CMS feature, based on the spec, planning brief, and project constitution. It focuses on areas with meaningful alternatives or risk.

---

## Framework & Runtime

**Decision:** Next.js 16 (App Router, React Server Components) with TypeScript strict mode.  
**Rationale:**
- Aligns with the existing project and leverages RSC for efficient server-driven rendering of admin and public pages.
- App Router simplifies nested layouts (`/admin` vs `(public)`) and Server Actions for mutations.
**Alternatives considered:**
- Next.js pages router: simpler but misaligned with long-term direction and RSC usage.
- Separate admin app: unnecessary complexity for a single-tenant site.

---

## Authentication & Authorization

**Decision:** better-auth v1.3.34 for authentication + custom RBAC helpers.  
**Rationale:**
- Provides modern, secure auth primitives compatible with Next.js App Router.
- RBAC (Admin, Editor, Author, Viewer) is better expressed in project-specific helpers (`lib/auth/permissions.ts`) than in a purely declarative config.
**Alternatives considered:**
- NextAuth.js: mature but not requested; better-auth is explicitly preferred in the stack.
- Homegrown auth: higher security and maintenance risk.

---

## Database & ORM

**Decision:** PostgreSQL with Drizzle ORM v0.44.7, single primary database for all CMS entities.  
**Rationale:**
- Strong typing, schema-first migrations, and composable queries.
- Matches constitution requirements: all access through ORM, foreign keys, unique constraints, migrations.
**Alternatives considered:**
- Prisma: feature-rich but not in requested stack.
- Multiple databases (content vs auth): overkill for current scale and complexity.

---

## Media Storage & Processing

**Decision:** Storage adapter abstraction with one primary backend per environment (Local for dev, S3 for production), plus basic server-side image processing via Sharp.

- `STORAGE_PROVIDER` env (`local` | `s3` | `supabase`-compatible).  
- `lib/storage/storage-adapter.ts` defines a common interface (upload, delete, getUrl, list, move).
- `lib/storage/local-storage.ts` and `s3-storage.ts` implement this interface.

**Rationale:**
- Satisfies the spec’s requirement for Local, S3, and Supabase compatibility while keeping data in a single backend per environment.
- Avoids operational complexity of mixing providers per asset.
- Sharp allows thumbnail and responsive image variants, satisfying media requirements and constitution image rules.

**Alternatives considered:**
- Using multiple storage backends simultaneously per asset: more complex to reason about and migrate.
- Delegating all processing to a CDN: simpler server but external dependency and cost trade-offs.

---

## Video Handling

**Decision:** Direct upload of short video files with a size limit and no transcoding, plus support for external embeds (YouTube, Vimeo, etc.).

**Rationale:**
- Meets the spec while avoiding building a full video pipeline (encoding, adaptive streaming).
- Keeps performance and cost manageable; large or long-form video is offloaded to external platforms.

**Alternatives considered:**
- Full video pipeline (transcoding, adaptive streaming): higher complexity and infra requirements.
- Disallowing direct uploads: less flexible for small clips.

---

## Events Scope

**Decision:** Events are informational-only with optional external registration links; no built-in RSVP/registration.

**Rationale:**
- Aligns with spec clarification and keeps the data model simple (no ticketing, capacities, or attendee tables).
- Leaves room for external tools (Eventbrite, forms) via links.

**Alternatives considered:**
- Simple RSVP list: additional PII storage and UX, not requested.
- Full registration: out of scope for this feature.

---

## Calendar Library

**Decision:** Use React Big Calendar for admin and public calendar views.

**Rationale:**
- Well-suited to event calendars with month/week/day views.
- Integrates with date-fns and supports custom event components.

**Alternatives considered:**
- FullCalendar: powerful but heavier; React Big Calendar is sufficient for current needs.

---

## Scheduling & Background Work

**Decision:** Scheduled publishing handled by a time-based job that promotes `SCHEDULED` content to `PUBLISHED` when `scheduled_at` (articles) or `start_date` (events/promotions) thresholds are reached.

Implementation options (to choose at deployment time):
- Cron-like job (e.g., hosted scheduler hitting an internal route or server action).
- Background worker process triggered by a queue.

**Rationale:**
- Keeps the CMS logic simple: scheduling is just a state change and timestamp check.

**Alternatives considered:**
- On-request scheduling (checking timestamps on each page load): simpler infra but more complex caching and edge cases.

---

## Testing Stack

**Decision:**
- Unit & integration tests: Jest (or Vitest) with React Testing Library.
- E2E tests: Playwright.

**Rationale:**
- Both Jest and Vitest are well-supported in TypeScript/Next.js projects; choice can be made based on existing tooling in the repo (Jest is the default assumption if none).
- Playwright aligns with constitution focus on robust E2E coverage for critical flows.

**Implementation note:** Confirm the currently installed testing framework (if any) and align with it to avoid duplication.

---

## API Surface & Integrations

**Decision:**
- Internal CRUD uses Server Actions in the App Router.
- API routes reserved for:
  - External webhooks (`/api/webhooks/*`).
  - Preview token exchange if needed.

**Rationale:**
- Restricts public API surface, reducing attack surface.
- Matches spec guidance to use API routes only for external integrations.

**Alternatives considered:**
- Full REST API for all CMS operations: unnecessary given single-tenant admin UI and Server Actions support.

---

## Open Items / Implementation Notes

- Verify current npm versions for all dependencies (Next.js, Drizzle, better-auth, TipTap, shadcn/ui, dnd-kit, React Big Calendar, Sharp, date-fns, testing libraries) before implementation and adjust `package.json` accordingly.
- Confirm hosting/deployment environment (e.g., Vercel vs custom Node) to finalize scheduling and background job strategy.
- Decide whether Redis (or another cache) will be introduced now or reserved for a later performance-focused feature.
