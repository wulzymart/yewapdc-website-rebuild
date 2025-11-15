# YEWAPDC Website Rebuild Constitution

## Core Principles

### I. Security First (NON-NEGOTIABLE)

All user-facing and internal functionality MUST be designed and implemented with security as a primary concern. Inputs are validated and sanitized, secrets are protected, and authentication/authorization flows are robust and monitored.

### II. Code Quality & Maintainability

The codebase MUST remain simple, consistent, and maintainable. TypeScript strict mode, linting/formatting rules, and clear architectural boundaries are enforced to ensure long‑term health and ease of change.

### III. Data Integrity & Persistence

All data MUST be stored, accessed, and mutated through a well‑defined ORM layer with strong integrity guarantees: audit fields, foreign keys, reversible migrations, and clear backup strategies.

### IV. Reliability, Performance & Accessibility

The system MUST be fast enough, reliable enough, and accessible enough to serve users effectively. Performance budgets, accessibility standards, and UX constraints are explicit, measurable, and enforced.

### V. Testing, Content & API Discipline

Critical flows MUST be protected by automated tests and stable APIs. Content rules (slugs, media, visibility) and API standards (validation, error handling, pagination) are codified to prevent regressions and inconsistencies.

---

## Detailed Standards

### 1. Security

- **Input Handling**
  - All external inputs (HTTP requests, forms, query params, headers, file uploads) MUST be validated and sanitized.
  - XSS and injection protection MUST be in place (e.g., escaping, sanitizing rich-text output, parameterized queries).
  - CSRF protection MUST be enabled for all state‑changing operations.

- **Secrets & Credentials**
  - Secrets (API keys, DB credentials, auth secrets) MUST be provided via environment variables or secure secret stores.
  - Secrets MUST NEVER be committed to the repository (including `.env` contents).
  - Secret usage MUST be centralized where practical, to simplify rotation.

- **Authentication & Authorization**
  - Auth tokens MUST be stored in httpOnly cookies (or equivalent secure mechanism) to mitigate XSS.
  - Passwords MUST be hashed using a strong, vetted algorithm (e.g. bcrypt, argon2), never stored in plaintext.
  - Rate limiting MUST be applied to login and other sensitive endpoints to mitigate brute‑force attacks.
  - RBAC MUST be enforced at the server for all protected resources.

- **File Uploads**
  - File uploads MUST be validated for:
    - Type (MIME/extension whitelist).
    - Size (per‑file and aggregate limits).
  - Uploaded files MUST be stored in locations not directly executable as code.
  - Media URLs MUST NOT leak sensitive internal paths.

### 2. Code Quality

- **TypeScript & Style**
  - TypeScript `strict` mode MUST be enabled.
  - The use of `any` MUST be avoided; explicit types MUST be preferred.
  - ESLint and Prettier (or equivalent) MUST be configured and enforced via CI.
  - There MUST be no unused variables or imports in committed code.

- **Structure & Size**
  - Each React component or module SHOULD live in its own file.
  - Individual source files SHOULD NOT exceed ~300 lines, unless clearly justified.
  - Shared logic MUST be extracted into utilities/hooks/components to avoid duplication (DRY).

- **Test Coverage**
  - New code MUST come with tests when feasible; critical flows MUST have strong coverage.
  - Overall test coverage for new or significantly changed areas MUST be at least **70%**.
  - Coverage MUST be monitored (locally and/or in CI).

### 3. Database & Persistence

- **Audit Fields**
  - Every persisted table/entity MUST include:
    - `created_at`
    - `updated_at`
    - `created_by`
    - `updated_by`
  - These fields MUST be set and updated by the application at appropriate times.

- **ORM & Constraints**
  - All DB access and mutations MUST go through the ORM (no ad‑hoc SQL except in documented, reviewed exceptions).
  - Foreign key constraints MUST be enforced at the database level.
  - Slug and other uniqueness constraints MUST be enforced by the database (e.g. unique indexes).

- **Migrations & Backups**
  - All schema changes MUST be performed via versioned migrations.
  - Migrations MUST be reversible or have a clear rollback plan.
  - Database backups MUST be taken before major or destructive migrations and documented.

- **Environments**
  - Seed data SHOULD be provided for development and testing environments.
  - Tests MUST run against a dedicated test database (never production or shared dev).

### 4. Error Handling

- **Async Operations**
  - All async code that can fail (DB calls, network calls, file I/O, external APIs) MUST be wrapped in appropriate try‑catch blocks or equivalent error handling constructs.

- **User vs Technical Messages**
  - User‑facing errors MUST be friendly, non‑technical, and actionable.
  - Technical details (stack traces, sensitive data, internal IDs) MUST only be logged server‑side.

- **HTTP & API Errors**
  - API routes MUST use appropriate HTTP status codes:
    - 200/201 for success,
    - 400 for validation errors,
    - 401 for unauthenticated,
    - 403 for unauthorized,
    - 404 for not found,
    - 500 for unexpected server errors.
  - Validation errors MUST return field‑level details where feasible.

- **React Error Boundaries**
  - React error boundaries MUST be implemented for critical UI regions (e.g. layout, core flows) to prevent full‑page crashes.
  - Error boundaries SHOULD route users to friendly fallback UIs.

### 5. Performance

- **Budgets**
  - Page load (initial view) SHOULD be under **3s** on a typical network.
  - Time to Interactive (TTI) SHOULD be under **5s**.
  - Response times for key APIs SHOULD be monitored and optimized.

- **Assets & Images**
  - Image optimization (e.g. Next.js `<Image>`) is MANDATORY for non‑trivial images.
  - Below‑the‑fold content SHOULD be lazy‑loaded where practical.
  - Static assets SHOULD be cached with sensible headers.

- **Data Access**
  - N+1 queries MUST be avoided; apply joins, eager loading, or caching where needed.
  - Appropriate indexes MUST be created for frequently queried columns.

### 6. Accessibility

- **Standards**
  - The UI MUST meet **WCAG 2.1 AA** at minimum for all key flows.

- **Implementation**
  - Semantic HTML elements MUST be used (e.g. `<button>`, `<nav>`, `<main>`, `<header>`).
  - Keyboard navigation MUST be supported (focus states, tab order, skip links where needed).
  - Alt text for images MUST be required for meaningful images.
  - Color contrast MUST meet AA thresholds; themes MUST be checked for contrast regressions.

### 7. Testing

- **Types of Tests**
  - Unit tests:
    - MUST cover utility functions and business logic.
  - Integration tests:
    - MUST cover API routes, server actions, and DB operations for critical flows.
  - E2E tests:
    - MUST cover core user journeys (e.g. login, create article, publish, key dashboards).

- **Policies**
  - New code SHOULD maintain or increase overall coverage; never significantly reduce it without explicit justification.
  - Tests MUST pass in CI before merging to main branches.
  - External services MUST be mocked or stubbed in automated tests (no live external calls).
  - Test databases and fixtures/factories MUST be used; production or shared dev data MUST NOT be used in automated tests.

### 8. Content & Media Rules

- **Slugs & URLs**
  - All content URLs MUST use SEO‑friendly slugs (lowercase, hyphen‑separated).
  - Slug uniqueness MUST be enforced at DB level where relevant.
  - Slugs SHOULD be generated automatically from titles, with the ability to override if needed.

- **Media**
  - Max upload size:
    - Images: **10MB** per file.
    - Videos: **50MB** per file (if supported).
  - Supported image formats: **JPEG, PNG, WebP, GIF**.
  - Image alt text MUST be required for accessibility.
  - Automatic image optimization and responsive variants MUST be used where possible.

- **Visibility & Caching**
  - Draft content MUST only be visible to authenticated CMS users with appropriate permissions.
  - Published content MAY be cached for performance, with sensible revalidation/invalidations on updates.

### 9. API Standards

- **Design**
  - API endpoints MUST follow RESTful conventions (resource‑oriented URIs, appropriate HTTP methods).
  - Responses MUST use a consistent envelope:
    - `{ success: boolean, data?: T, error?: string | { message: string; details?: unknown } }`.

- **Reliability & Limits**
  - Rate limiting MUST be applied to public endpoints and sensitive operations.
  - API versioning SHOULD be used when external integrations are planned or present.

- **Validation & Pagination**
  - All incoming requests MUST be validated with Zod (or equivalent schema library) before processing.
  - List endpoints MUST support pagination (limit/offset or cursor‑based) and SHOULD enforce maximum page sizes.

- **Monitoring**
  - Response times for critical APIs SHOULD be measured, logged, and optimized over time.

---

## Development Workflow, Review Process & Quality Gates

1. **Spec → Plan → Tasks**
   - Features MUST start with a specification, implementation plan, and tasks document aligned to this constitution.
   - Any exceptions to constitutional principles MUST be documented and justified in the plan (with impact analysis).

2. **Test‑First Mindset**
   - For critical flows, tests SHOULD be written or at least fully specified before implementation.
   - Bug fixes SHOULD include regression tests.

3. **Code Review**
   - Every PR MUST be reviewed by at least one other developer.
   - Reviewers MUST check:
     - Security implications.
     - Compliance with code quality rules.
     - Test coverage and results.
     - Adherence to content and API standards.

4. **CI & Quality Gates**
   - CI MUST run linting, type checking, and tests on each PR.
   - PRs MUST NOT be merged if:
     - Lint/type checks fail.
     - Tests fail.
     - Coverage drops below agreed thresholds without explicit justification.

5. **Environments**
   - Production, staging, and testing environments MUST be clearly separated.
   - Test and staging environments MUST use non‑production credentials and data.

---

## Governance

- This constitution supersedes ad‑hoc practices and undocumented conventions for this project.
- Any proposed changes to these principles MUST:
  - Be documented (what, why, risks).
  - Be reviewed and approved via PR by responsible maintainers.
  - Include a migration/mitigation plan for existing code and data where applicable.
- Code reviews, design reviews, and automated checks MUST enforce this constitution.
- Exceptions are allowed only when:
  - Explicitly documented,
  - Time‑boxed or scoped,
  - And accompanied by a follow‑up task to return to compliance.

**Version**: 1.0.0  
**Ratified**: 2025‑11‑14  
**Last Amended**: 2025‑11‑14