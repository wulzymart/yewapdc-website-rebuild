# Feature Specification: Custom CMS for Next.js Website

**Feature Branch**: `001-custom-cms`  
**Created**: 2025-11-14  
**Status**: Draft  
**Input**: User description: "Build a custom CMS for a Next.js website with rich content management, events, promotional posts, media management, persons management, roles & permissions, dashboard, site configuration, and preview & publishing features."

## Clarifications

### Session 2025-11-15

- Q: What is the media storage strategy across Local, S3, and Supabase? → A: One configurable primary backend per environment (local for development, cloud object storage for production).

- Q: How should the CMS handle direct video uploads vs embedded videos? → A: Allow direct uploads with a reasonable size limit and no automatic transcoding; use embeds for longer or externally hosted videos.

- Q: Are events informational only or should the CMS support registration/RSVP flows? → A: Events are informational only; no built-in registration or RSVP, but editors can add external registration links.

---

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

### User Story 1 - Manage core site content (Priority: P1)

An Admin or Editor signs into the CMS to create, edit, schedule, and publish news articles, blog posts, events, and promotional banners using rich text, images, galleries, and embedded or uploaded videos.

**Why this priority**: This journey delivers the primary value of the CMS: keeping the public website up to date with timely, media-rich content without developer involvement.

**Independent Test**: A tester can verify that an Editor can create a new article, related event, and a time-bound promo, schedule them for future publication, and see them appear and expire correctly on the site without any additional configuration.

**Acceptance Scenarios**:

1. **Given** an Editor with appropriate permissions, **When** they create an article with rich text, featured image, gallery, SEO metadata, and assign optional categories and status, **Then** the article is saved and can be scheduled or published immediately.
2. **Given** scheduled articles, events, and promos, **When** the current time passes each item’s start or end time, **Then** the items automatically appear or stop appearing on the public site according to their configured status.

---

### User Story 2 - Author workflow with review (Priority: P2)

An Author signs into the CMS, drafts a new article or event with media and SEO details, and submits it for review so that an Editor or Admin can publish it.

**Why this priority**: Separating content creation from publishing allows more contributors while maintaining editorial control and content quality.

**Independent Test**: A tester can verify that an Author can create content but cannot publish it, and that an Editor can review, request changes, and publish or schedule the same content.

**Acceptance Scenarios**:

1. **Given** an Author role, **When** they create or edit a draft article or event, **Then** they can save drafts and submit items for review but cannot change the item to a published state.

---

### User Story 3 - Manage media, persons, and site configuration (Priority: P3)

An Admin uses the CMS to organize the media library, maintain persons and their offices, and configure global site settings, navigation, footer content, and social links so the public site remains consistent and trustworthy.

**Why this priority**: These capabilities ensure the site’s structure, branding, and key organisational information are accurate and easy to maintain over time.

**Independent Test**: A tester can verify that an Admin can upload and organize media, update persons and offices, adjust navigation and footer content, and see those changes reflected consistently in all relevant areas of the site.

**Acceptance Scenarios**:

1. **Given** an Admin role, **When** they update navigation items, footer content, or social links in the CMS, **Then** the public site reflects the new structure and links without developer intervention.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when multiple promos overlap in time for the same position (hero, sidebar, footer), or there is a tie in priority?
- How does the system handle scheduled items when the site’s timezone or daylight saving changes affect start and end times?
- What happens when required media assets are deleted, moved, or become unavailable for published content?
- How does the system behave when very large files are uploaded or when storage limits are reached?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow authorized users to create, edit, categorize, schedule, and publish news articles and blog posts with rich text, featured images, image galleries, embedded or uploaded videos, and SEO metadata (title, description, keywords, and social sharing tags).
- **FR-002**: System MUST allow authorized users to create and manage events with title, description, start and end date/time, location, optional categories, image galleries, and visibility controls, and to present events in both list and calendar views with filtering by category and date.
- **FR-003**: System MUST support time-bound promotional content that can be assigned a position (e.g., hero banner, sidebar, footer), start and end dates, and priority ordering, and MUST automatically show or hide promos on the public site according to these settings.
- **FR-004**: System MUST provide a centralized media library where users can upload multiple files in bulk, manage metadata (alt text, captions, descriptions, tags), organize items in a file and folder structure, search and filter media by type, date, and tags, and see previews for common file types (images, videos, audio, PDFs).
- **FR-005**: System MUST support basic image editing actions (such as resizing and cropping) and generate appropriate thumbnail and responsive image variants for use across the site.
- **FR-006**: System MUST allow creation, viewing, editing, and deletion of person records, including name, role/title, bio/description, photo, and assignment of one or more offices (e.g., Board of Trustees, Traditional Council, Executives).
- **FR-007**: System MUST enforce user roles and permissions so that Admins have full access, Editors can create, edit, and publish all content, Authors can create and edit their own content and submit it for review, and Viewers have read-only access to CMS content and activity.
- **FR-008**: System MUST provide a dashboard that summarizes key statistics (e.g., total articles, upcoming events, active promotions), shows recent CMS activity, displays a calendar of scheduled publications, and offers quick actions such as creating new content or uploading media.
- **FR-009**: System MUST allow configuration of global site settings (such as site name, description, and contact information), navigation menus with drag-and-drop ordering, footer content, and social media links, with changes reflected consistently across the public site.
- **FR-010**: System MUST provide preview and publishing capabilities so that users can see a live preview of content before publishing, view scheduled publication queues and resulting URLs, and preview content in layouts that represent typical mobile and desktop experiences.
- **FR-011**: System MUST maintain an activity history for key content operations (create, update, publish, unpublish, delete) so Admins can review who changed what and when.
- **FR-012**: System MUST support configuring a single primary media storage backend per environment (for example, local storage for development and a cloud-based object store for production) and allow switching backend type through configuration without impacting content editors' workflows.
 - **FR-013**: System MUST support direct upload of short video files with a defined size limit and no automatic transcoding, while also allowing content editors to embed externally hosted videos (such as YouTube or Vimeo) for longer or more complex video content.
 - **FR-014**: System MUST treat events as informational entries only (no built-in registration or RSVP flows), while allowing editors to include external registration links or references where needed.

### Key Entities *(include if feature involves data)*

- **Article/Post**: Represents news articles and blog posts, including title, body content, rich media, categories, status (draft, scheduled, published), publication dates, and SEO metadata.
- **Event**: Represents scheduled happenings with title, description, start and end date/time, location details, categories, associated media, and visibility status.
- **Promotional Post**: Represents time-bound promotional content with messaging, media, call-to-action configuration, position (hero, sidebar, footer), start and end dates, and priority.
- **Media Asset**: Represents uploaded files (images, videos, audio, documents) with metadata (filename, type, size, alt text, captions, descriptions, tags), folder location, previews, and generated variants.
- **Person**: Represents an individual associated with the organisation, including name, photo, biography/description, contact details (if applicable), and assigned offices.
- **Office/Role Assignment**: Represents the relationship between persons and offices (e.g., Board of Trustees, Traditional Council, Executives), allowing multiple offices per person.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: At least 90% of trained Editors can create, preview, schedule, and publish a typical article with media, SEO metadata, and optional categorization in under 5 minutes without assistance.
- **SC-002**: Scheduled articles, events, and promotional posts appear and expire at the correct times on the public site in at least 99% of test cases, based on the configured timezone and start/end dates.
- **SC-003**: In usability tests, at least 90% of Admin and Editor users can answer “what content is scheduled or expiring in the next 7 days?” using the dashboard and calendars within 30 seconds.
- **SC-004**: In usability tests, at least 90% of Editors can locate an existing media asset using the media library’s search and filters within three search attempts, and report that managing media, persons, and site configuration is easier than their previous process.
