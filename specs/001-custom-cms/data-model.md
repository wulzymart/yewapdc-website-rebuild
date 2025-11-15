# Data Model: Custom CMS for Next.js Website

This document summarizes the main entities, fields, and relationships for the CMS, based primarily on the provided schema plus clarifications from the spec.

---

## Users

Represents authenticated CMS users and, indirectly, authors of content.

- `id` (uuid, PK)
- `email` (string, unique)
- `name` (string)
- `role` (enum: ADMIN, EDITOR, AUTHOR, VIEWER)
- `password_hash` (string) – managed by auth system
- `created_at`, `updated_at`, `deleted_at` (timestamps)

**Relationships:**
- One `User` can author many `Articles`, `Events`, `Promotions`, `Media`, `Persons`.
- `ActivityLog.user_id` references `Users.id`.

---

## Articles

Represents news articles and blog posts.

- `id` (uuid, PK)
- `title` (string)
- `slug` (string, unique)
- `content` (text, TipTap HTML/JSON)
- `excerpt` (text, optional)
- `featured_image_id` (uuid, FK → Media.id)
- `status` (enum: DRAFT, PUBLISHED, SCHEDULED)
- `category_id` (uuid, FK → Categories.id, optional; type=ARTICLE)
- `author_id` (uuid, FK → Users.id)
- `published_at` (timestamp, nullable)
- `scheduled_at` (timestamp, nullable)
- `seo_title` (string, optional)
- `seo_description` (text, optional)
- `seo_keywords` (string[], optional)
- `og_image_id` (uuid, FK → Media.id, optional)
- `created_at`, `updated_at`, `deleted_at` (timestamps)
- `created_by`, `updated_by` (uuid, FKs → Users.id)

**Relationships:**
- Many Articles → one Author (`Users`).
- Many Articles → optional one Category (ARTICLE-type).
- Optional one featured image and one OG image (`Media`).

**State transitions:**
- DRAFT → SCHEDULED (when `scheduled_at` set in future).
- DRAFT or SCHEDULED → PUBLISHED (via scheduled job or manual publish, setting `published_at`).

---

## Events

Informational events with optional image galleries.

- `id` (uuid, PK)
- `title` (string)
- `slug` (string, unique)
- `description` (text, rich HTML)
- `start_date` (timestamp)
- `end_date` (timestamp)
- `location` (string, optional)
- `category_id` (uuid, FK → Categories.id, optional; type=EVENT)
- `status` (enum: DRAFT, PUBLISHED)
- `seo_title` (string, optional)
- `seo_description` (text, optional)
- `created_at`, `updated_at`, `deleted_at` (timestamps)
- `created_by`, `updated_by` (uuid, FKs → Users.id)

**Relationships:**
- One Event → many EventImages.
- Many Events → optional one Category (EVENT-type).

**State transitions:**
- DRAFT → PUBLISHED when ready; optional scheduling is handled via `start_date` semantics and listing filters.

---

## EventImages

Junction entity for event image galleries.

- `id` (uuid, PK)
- `event_id` (uuid, FK → Events.id)
- `media_id` (uuid, FK → Media.id)
- `order` (integer)
- `created_at` (timestamp)

**Relationships:**
- Many EventImages → one Event.
- Many EventImages → one Media (shared asset).

---

## Promotions

Time-bound promotional content for hero/sidebar/footer.

- `id` (uuid, PK)
- `title` (string)
- `content` (text, rich HTML)
- `media_id` (uuid, FK → Media.id, optional)
- `cta_text` (string, optional)
- `cta_link` (string, optional)
- `start_date` (timestamp)
- `end_date` (timestamp)
- `priority` (integer, default 0; higher = more important)
- `position` (enum: HERO, SIDEBAR, FOOTER)
- `is_active` (boolean, default true)
- `created_at`, `updated_at`, `deleted_at` (timestamps)
- `created_by`, `updated_by` (uuid, FKs → Users.id)

**Relationships:**
- Optional one associated Media asset.

**Behavioral notes:**
- Filtering and ordering by date range + `priority` drive what is shown on the homepage.

---

## Media

Represents uploaded files (images, videos, audio, documents).

- `id` (uuid, PK)
- `filename` (string)
- `original_filename` (string)
- `url` (string)
- `storage_provider` (enum: LOCAL, S3, SUPABASE)
- `storage_path` (string)
- `type` (enum: IMAGE, VIDEO, AUDIO, DOCUMENT)
- `mime_type` (string)
- `size` (bigint, bytes)
- `width` (integer, nullable)
- `height` (integer, nullable)
- `duration` (integer, nullable; seconds)
- `alt_text` (string, optional)
- `caption` (text, optional)
- `description` (text, optional)
- `folder_id` (uuid, FK → MediaFolders.id, nullable)
- `thumbnail_url` (string, nullable)
- `uploaded_by` (uuid, FK → Users.id)
- `created_at`, `updated_at`, `deleted_at` (timestamps)

**Relationships:**
- Many Media assets → optional one folder.
- Media may be referenced from Articles, Events (via EventImages), Promotions, Persons (photo), etc.

---

## MediaFolders

Hierarchical folder structure for organizing media.

- `id` (uuid, PK)
- `name` (string)
- `parent_id` (uuid, FK → MediaFolders.id, nullable)
- `path` (string, computed from hierarchy)
- `created_at`, `updated_at` (timestamps)
- `created_by`, `updated_by` (uuid, FKs → Users.id)

**Relationships:**
- One folder → many child folders (self-referential).
- One folder → many Media assets.

---

## MediaTags

Many-to-many association between Media and Tags.

- `media_id` (uuid, FK → Media.id)
- `tag_id` (uuid, FK → Tags.id)

**Relationships:**
- Many MediaTags → one Media.
- Many MediaTags → one Tag.

---

## Persons

Represents people (distinct from Users) associated with the organisation.

- `id` (uuid, PK)
- `first_name` (string)
- `last_name` (string)
- `full_name` (string, computed)
- `bio` (text, optional)
- `photo_id` (uuid, FK → Media.id, optional)
- `created_at`, `updated_at`, `deleted_at` (timestamps)
- `created_by`, `updated_by` (uuid, FKs → Users.id)

**Relationships:**
- One Person → many PersonOffices records.

---

## Offices

Defines organisational offices (e.g., "Board of Trustees").

- `id` (uuid, PK)
- `name` (string)
- `description` (text, optional)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- One Office → many PersonOffices.

---

## PersonOffices

Junction entity linking Persons to Offices (one person can hold multiple offices over time).

- `id` (uuid, PK)
- `person_id` (uuid, FK → Persons.id)
- `office_id` (uuid, FK → Offices.id)
- `title` (string, optional; e.g., "Chairman")
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- Many PersonOffices → one Person.
- Many PersonOffices → one Office.

---

## Categories

Categories for Articles and Events.

- `id` (uuid, PK)
- `name` (string)
- `slug` (string, unique)
- `type` (enum: ARTICLE, EVENT)
- `description` (text, optional)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- One Category → many Articles (type=ARTICLE).
- One Category → many Events (type=EVENT).

---

## Tags

Global tag vocabulary.

- `id` (uuid, PK)
- `name` (string, unique)
- `slug` (string, unique)
- `created_at` (timestamp)

**Relationships:**
- Tags associated to Media via MediaTags; may be reused for other entities later.

---

## SiteSettings

Key-value store for global configuration.

- `id` (uuid, PK)
- `key` (string, unique) – e.g., `site_name`, `site_description`.
- `value` (text)
- `type` (enum: STRING, TEXT, JSON, BOOLEAN)
- `updated_at` (timestamp)
- `updated_by` (uuid, FK → Users.id)

---

## NavigationMenus

Stores navigation menus as JSON structures.

- `id` (uuid, PK)
- `location` (enum: HEADER, FOOTER)
- `items` (json) – array of menu items (`title`, `url`, `order`, `children`)
- `updated_at` (timestamp)
- `updated_by` (uuid, FK → Users.id)

---

## ActivityLog

Audit log of key actions.

- `id` (uuid, PK)
- `user_id` (uuid, FK → Users.id)
- `action` (string, e.g., "created", "updated", "deleted", "published")
- `entity_type` (string, e.g., "Article", "Event")
- `entity_id` (uuid)
- `metadata` (json, optional)
- `created_at` (timestamp)

**Relationships:**
- Many ActivityLog entries → one User.

---

## Cross-Cutting Rules

- All slugs must be unique per entity type and generated from titles with conflict resolution.
- `deleted_at` fields enable soft deletes; queries for public content must filter on `deleted_at IS NULL` and appropriate `status`.
- `created_by` / `updated_by` (where present) must be set from the authenticated `User` context via Server Actions.
