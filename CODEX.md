# Advantage PWA Codex Notes

Use this file together with `CLAUDE.md`.

## Workflow

- Claude is the primary planning/architecture AI for this repo.
- Codex is the implementation AI.
- Claude and Codex may share the same repository, but they should not edit simultaneously.
- If the repo state looks mid-edit or ambiguous, stop and inspect before changing files.

## Execution Rules

- Read `CLAUDE.md` before making changes.
- Preserve existing app-router, component, and styling patterns.
- Keep public branding as Advantage/AdvantageNYS, not AdvantageOS.
- Do not change interfaces or introduce extra features unless the task explicitly requires it.
- Prefer modifying existing files over creating new ones.
- Keep repo-local AI instructions in sync across `CLAUDE.md`, `AGENTS.md`, and `CODEX.md`.

## Required Checks

For code changes, run:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Current Project Snapshot

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 4
- Path alias `@/*` -> `src/*`

Canonical project details live in `CLAUDE.md`.
