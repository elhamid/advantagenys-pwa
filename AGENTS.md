# Advantage PWA Agent Instructions

## Purpose

This repository uses both Claude and Codex in the same folder, but not at the same time.

- `CLAUDE.md` is the primary repo context file.
- `CODEX.md` is the Codex-specific handoff file.
- Keep these files aligned instead of creating separate competing workflows.

## Operating Rules

- Only one AI agent should be actively making changes in this repo at a time.
- Do not rewrite architecture, contracts, or repo conventions unless explicitly requested.
- Follow existing patterns in the codebase before introducing new code.
- Keep changes minimal and task-scoped.
- Do not add dependencies unless explicitly requested.

## Validation

Before closing code changes, run:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Repo Context Source

Read `CLAUDE.md` first for:

- stack and project structure
- naming and routing conventions
- integration points
- repo-specific gotchas

Use `CODEX.md` for Codex execution rules specific to this repository.

---

# Cross-Repo Integration Contracts

## PWA → Taskboard: Lead Webhook

### Endpoint
POST `{TASKBOARD_WEBHOOK_URL}/api/webhooks/pwa-lead`

### Authentication
Header: `x-pwa-secret: {PWA_WEBHOOK_SECRET}`

### Request Body
```json
{
  "fullName": "string (required)",
  "phone": "string (required)",
  "email": "string (optional)",
  "businessType": "string (optional)",
  "services": ["string array (optional)"],
  "message": "string (optional)"
}
```

### Response
- 201: `{ success: true, taskId: "uuid" }`
- 400: `{ error: "message" }`
- 401: `{ error: "Unauthorized" }`

### Service Mapping (taskboard side)
| PWA Service Label | Taskboard Slug |
|---|---|
| Business Formation | formation |
| Licensing | licensing |
| Tax Services | tax |
| Insurance | insurance |
| Audit Defense | audit |
| ITIN | itin |
| (default) | consulting |

### Human Detection
Cloudflare Turnstile (invisible mode) verified server-side before webhook call.

### Environment Variables
| Variable | Repo | Purpose |
|---|---|---|
| PWA_WEBHOOK_SECRET | Both | Shared secret |
| TASKBOARD_WEBHOOK_URL | PWA | Webhook endpoint URL |
| TURNSTILE_SECRET_KEY | PWA | Cloudflare server-side key |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | PWA | Cloudflare client-side key |
