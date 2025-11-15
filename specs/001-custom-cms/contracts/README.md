# Contracts: External Integrations & Preview

This feature primarily uses Next.js Server Actions for internal CMS mutations. API routes are reserved for external integrations and preview-related flows.

---

## Preview Flow

Public previews of draft content are enabled via a tokenized route under the public app segment.

### Route

- `GET /preview/[token]`

### Purpose

- Allow trusted recipients to view draft content before it is published, without logging into the CMS.

### Request

- Path parameter: `token` (string, UUID or similar unique token).

### Behavior

- Look up preview by `token` (server-side): maps to a specific draft entity (e.g., Article or Event) and type.
- Validate that the token:
  - Exists.
  - Is not expired.
  - Has not been invalidated by publishing or explicit revocation.
- Render the appropriate page using the draft version of the content.
- Apply a visible “Preview” banner/watermark.

### Errors

- `404` if token not found or expired.
- `410` (optional) if token was explicitly revoked.

---

## Webhooks (Placeholder)

The `/api/webhooks` namespace is reserved for future external integrations (e.g., form providers, payment platforms, or external event sources).

### Base Path

- `POST /api/webhooks/[provider]`

### Envelope

All webhook handlers should follow a consistent response shape:

```json
{
  "success": true,
  "error": null
}
```

On error:

```json
{
  "success": false,
  "error": {
    "message": "Description of the error",
    "details": {}
  }
}
```

### Security

- All webhook endpoints MUST validate a shared secret, signature header, or equivalent mechanism.
- Payloads MUST be validated with Zod before processing.

### Status

- As of this plan, no concrete webhook providers are defined. This contract will be extended when an integration is specified.

---

## Internal Server Actions (Non-public)

CRUD operations for Articles, Events, Promotions, Media, Persons, Offices, Navigation, and SiteSettings are not exposed as public HTTP APIs. Instead, they are implemented as Server Actions in the relevant admin routes.

These actions should:

- Validate input with Zod.
- Enforce RBAC via `lib/auth/permissions.ts`.
- Use `lib/services/*` for domain logic.
- Return a consistent result shape:

```ts
{
  success: boolean;
  data?: unknown;
  error?: string;
}
```

This pattern is internal to the Next.js app and not intended for third-party consumption.
