<!--
SYNC IMPACT REPORT
==================
Version change: [unversioned template] → 1.0.0
Added sections: Core Principles (I–V), Tech Stack, Development Workflow, Governance
Removed sections: N/A (initial population)
Modified principles: N/A (initial population)

Templates reviewed:
  ✅ .specify/templates/spec-template.md — aligned (User Scenarios, Requirements, Success Criteria)
  ✅ .specify/templates/plan-template.md — aligned (Constitution Check gate retained)
  ✅ .specify/templates/tasks-template.md — aligned (TDD ordering, story independence)

Follow-up TODOs: none — all placeholders resolved from repo context.
-->

# start-claude Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST begin with a written spec before any production code is
written. Specs live in `specs/<issue-id>-<slug>/spec.md` using the Spec Kit
format and are permanent — they accumulate to describe the full product over
time and MUST NOT be deleted after implementation.

The workflow is strictly ordered:
1. `/design` — produces spec + ADR (if needed) + Playwright stubs
2. Human review of design artifacts
3. `/implement` — implements code to make stubs green

Skipping the spec phase or writing code before the spec is approved is a
constitution violation.

### II. Test-Driven Development — Playwright-First (NON-NEGOTIABLE)

Acceptance criteria in specs MUST be translated into Playwright E2E test stubs
(`e2e/<issue-id>.spec.ts`) during `/design`. These stubs MUST exist and be
skipped (not absent) before implementation begins.

During `/implement`, stubs are filled in and run iteratively — each scenario
MUST be green before moving to the next. The full suite (`bun run test:e2e`)
MUST pass before opening a PR.

For SSR (TanStack Start) apps specifically:
- MUST call `await page.waitForLoadState("networkidle")` after every
  `page.goto()` to ensure React has hydrated before interacting
- MUST use `pressSequentially()` instead of `fill()` for React controlled
  inputs

Vitest unit tests (`src/__tests__/`) are used only for pure logic with no UI
dependency.

### III. Simplicity (KISS + YAGNI)

Every implementation decision MUST prefer the simplest solution that satisfies
the current spec. Building for hypothetical future requirements is prohibited.

Complexity MUST be justified in the plan's Complexity Tracking table. If a
simpler alternative exists that meets the spec, it MUST be chosen.

- No premature abstractions — extract shared logic only once there are 3+ real
  uses (DRY threshold)
- No feature flags, backwards-compat shims, or over-engineering beyond what
  the spec requires
- Validate only at system boundaries (user input, external APIs); trust
  internal code and framework guarantees

### IV. Conventional Commits + PR Workflow

All changes MUST go through a pull request — no direct pushes to `main`.

Commits MUST follow Conventional Commits:
- `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Branch prefixes match commit type: `feat/`, `fix/`, `chore/`, `docs/`

Quality gates MUST pass before merging:
```
bun run check:fix && bun run typecheck && bun run test && bun run test:e2e && bun run build
```

### V. Linear-Synced Lifecycle

Every feature MUST be tracked in Linear. Status transitions are automated by
skills:
- `/design` → moves issue to **In Progress**, posts spec link to issue
- `/implement` → moves issue to **In Review**, posts PR link as comment

Issues created without using `/kickoff` or `/design` MUST still be updated
manually to reflect the current status before work begins.

## Tech Stack

**Runtime**: Bun (package manager, test runner, server)
**Framework**: TanStack Start — file-based routing, SSR, server functions via
`createServerFn`
**UI**: React 19 + Tailwind CSS v4 + shadcn/ui (new-york style, neutral base,
CSS variables, Lucide icons)
**Path alias**: `@/*` → `src/*`
**Linting/Formatting**: Biome — tabs, double quotes. Not ESLint/Prettier.
`src/routeTree.gen.ts` is auto-generated — do not edit.
**Validation**: Zod at system boundaries
**State**: TanStack Router loaders for initial data; `router.invalidate()`
after mutations

## Development Workflow

```
/kickoff <idea>     → structured Linear issue (Todo)
/design <issue-id>  → branch + spec + ADR + Playwright stubs (In Progress)
                       human reviews artifacts
/implement <id>     → code + green tests + PR (In Review)
                       human reviews and merges
```

Artifacts produced per feature:
- `specs/<issue-id>-<slug>/spec.md` — permanent product spec (Spec Kit format)
- `docs/adr/NNNN-<slug>.md` — permanent architectural decision (if needed)
- `e2e/<issue-id>.spec.ts` — Playwright E2E tests (executable acceptance criteria)
- `src/__tests__/<issue-id>.test.ts` — Vitest unit stubs (only if pure logic)

## Governance

This constitution supersedes all other development practices in this repository.
Any practice not addressed here defaults to the principles above applied in
good faith.

**Amendments** require:
1. A PR updating this file with a version bump
2. A sync impact report (as an HTML comment at the top of this file) listing
   all affected templates and artifacts
3. Propagation of changes to affected `.specify/templates/` files

**Versioning policy** (semantic):
- MAJOR: removal or redefinition of a principle
- MINOR: new principle or section added
- PATCH: clarifications, wording, non-semantic refinements

All PRs and reviews MUST verify compliance with principles I and II before
merging. Constitution violations MUST be called out in PR review and resolved
before merge.

**Version**: 1.0.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05
