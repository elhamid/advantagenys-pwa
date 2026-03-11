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
