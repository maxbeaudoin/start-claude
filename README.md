# TanStack Start + Claude Code

A full-stack React boilerplate powered by [TanStack Start](https://tanstack.com/start) and [Claude Code](https://claude.ai/code), built around a spec-driven workflow that takes a Linear issue all the way to a merged PR. A todo list app is included as a working example.

## Prerequisites

- [Bun](https://bun.sh)
- [GitHub CLI](https://cli.github.com) (`gh`)
- [jq](https://jqlang.org) — used by Claude Code hooks
- A [Linear](https://linear.app) workspace and API key

## Stack

- [TanStack Start](https://tanstack.com/start) — file-based routing, SSR, server functions
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (new-york style, neutral base, Lucide icons)
- [TanStack Query](https://tanstack.com/query), [Form](https://tanstack.com/form), [Table](https://tanstack.com/table)
- [Biome](https://biomejs.dev) — linting and formatting (tabs, double quotes)
- [Vitest](https://vitest.dev) — unit tests
- [Playwright](https://playwright.dev) — E2E tests

## Setup

### Linear API Key

The workflow skills integrate with Linear to fetch issues and post results back as comments.

1. Generate a key at **Linear → Settings → API → Personal API keys**
2. Add it to `.claude/settings.local.json` (gitignored):
   ```json
   { "env": { "LINEAR_API_KEY": "lin_api_xxxxxxxxxxxx" } }
   ```
3. Restart Claude Code.

## Scripts

```bash
bun run dev          # Dev server on port 3000
bun run build        # Production build → .output/
bun run start        # Serve production build
bun run test         # Vitest unit tests
bun run test:e2e     # Playwright E2E tests
bun run typecheck    # TypeScript type checking
bun run check:fix    # Biome lint + format (auto-fix)
```

## Claude Code Workflow

The boilerplate ships with a todo list app as a working example — its [spec](specs/todo-list/spec.md), [plan](changes/mxb-8-todo-list/plan.md), and implementation in `src/features/todo-list/` show exactly what the workflow produces end to end.

**`/ship <issue-id or description>`** is the primary entry point — it creates the branch, runs the appropriate pipeline skills, pushes, opens a PR, posts back to Linear, and handles the Copilot review pass. Bug fixes and docs changes skip spec and plan automatically.

The pipeline skills can also be run individually to re-run a specific step:

- **`/spec`** — Writes or updates `specs/<feature>/spec.md` from a context file or prose description.
- **`/plan`** — Reads spec changes on the current branch, writes `changes/<slug>/plan.md`. Optional.
- **`/code`** — Implements new scenarios from the spec diff, writes tests, runs quality checks, commits.
- **`/review <pr-number>`** — Evaluates Copilot review comments, implements the valuable ones, dismisses the rest with rationale. Works on any PR.

### Output Files

| File | Location | Notes |
|------|----------|-------|
| Spec | `specs/<feature>/spec.md` | Living doc — kept forever, updated as the feature evolves |
| Plan | `changes/<issue-id>-<slug>/plan.md` | Versioned alongside the code change |
| ADR | `docs/adr/NNNN-<slug>.md` | Written when a significant architectural decision is made |
| E2E tests | `e2e/<feature>.spec.ts` | Generated from spec scenarios at `/code` time |
| Unit tests | `src/features/<feature>/<name>.test.ts` | Co-located with the feature code |

## Deploy on Railway

The easiest way to deploy is [Railway](https://railway.app/new).
