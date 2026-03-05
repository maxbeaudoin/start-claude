# TanStack Start + Bun

A full-stack React starter using [TanStack Start](https://tanstack.com/start) with [Bun](https://bun.sh).

## Prerequisites
- Node.js (v20+)
- Bun
- GitHub CLI (gh)
- jq (used by Claude Code hooks)

## Stack

- [TanStack Start](https://tanstack.com/start) — file-based routing, SSR, server functions
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- [TanStack Query](https://tanstack.com/query), [Form](https://tanstack.com/form), [Table](https://tanstack.com/table)
- [Biome](https://biomejs.dev) — linting & formatting
- [Vitest](https://vitest.dev) — testing

## Development

```bash
bun install
bun run dev
```

## Task Workflow

This project uses a design-first, TDD-driven workflow powered by [Claude Code](https://claude.ai/code) skills:

1. **`/design <Linear issue ID>`** — Fetches the issue, creates a feature branch, produces an ADR (if needed), a spec with Gherkin acceptance criteria, and failing test stubs.
2. **Review** the design artifacts on the branch.
3. **`/implement <Linear issue ID>`** — Implements code per the spec, iterates until tests pass, runs quality checks, and opens a PR.
4. **Review** the PR and merge.

Design artifacts live alongside code:
- `docs/adr/` — Architecture Decision Records (MADR v3)
- `docs/design/` — Feature specs with acceptance criteria

## Production

```bash
bun run build
bun run start
```

## Deploy on Railway
The easiest way to deploy this app is to use [Railway](https://railway.app/new).