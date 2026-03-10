---
name: code
description: Implements the feature changes introduced by spec changes on the current branch. Writes tests, runs quality checks, and commits.
model: sonnet
disable-model-invocation: true
---

# /code

Implements what the spec diff on the current branch describes. Scope is derived from
what changed in `specs/` — not the full spec, just what is new or changed.

## Input

`$ARGUMENTS` — required only when no spec diff exists (bug fix or trivial change).
Pass prose or `@path` to a context file. Ignored when a spec diff is present.

## Steps

### 1. Discover scope

Find which specs changed and what is new:

```bash
git diff main --name-only -- specs/
git diff main -- specs/<feature>/spec.md
```

The diff reveals which scenarios are new or changed — implement only those.
Scenarios already in the spec before this branch are already implemented.

If no spec exists (bug fix or trivial change), `$ARGUMENTS` must provide the requirement — either as prose or `@path` to a context file.

### 2. Read plan (if present)

```bash
git diff main --name-only -- changes/
```

Read the plan file(s) introduced on this branch for technical approach and file change guidance.
If absent, derive the approach from the spec and codebase context.

### 3. Implement in src/features/<feature>/

Follow the feature folder structure (ADR-0001):

```
src/features/<feature>/
  components/         # React components (if multiple, otherwise flat)
  <name>.tsx          # Main component (if simple)
  <name>.server.ts    # Server functions
  hooks.ts            # React hooks
  types.ts            # Types and Zod schemas
```

Route files go in `src/routes/` as a thin layer importing from the feature:

```ts
import { FeatureComponent } from "@/features/<feature>"
```

Conventions: TanStack Start file-based routing, shadcn/ui new-york style neutral base,
Tailwind CSS v4, `@/*` alias, Biome formatting (tabs, double quotes), Zod at system boundaries.

### 4. Write tests for new scenarios

For each **new or changed** scenario in the spec diff:

**Playwright** (`e2e/<feature>.spec.ts`) — for scenarios involving UI rendering,
user interaction, or full-stack flows:

```ts
test("<scenario name verbatim>", async ({ page }) => {
  await page.goto("/...");
  await page.waitForLoadState("networkidle");
  // implement scenario
});
```

SSR patterns (required):
- `waitForLoadState("networkidle")` after every `goto()`
- `pressSequentially()` instead of `fill()` for React controlled inputs

**Vitest** (`src/features/<feature>/<name>.test.ts`) — for server functions,
business logic, or data transforms.

### 5. Run quality checks

```bash
bun run check:fix && bun run typecheck && bun run test && bun run test:e2e && bun run build
```

Fix failures before proceeding. Iterate until all checks pass.

### 6. Simplify

Run `/simplify` to review all changed code for reuse, quality, and efficiency.

### 7. Commit

```bash
git add src/ e2e/
git commit -m "<type>: <description>"
```

Use the conventional commit prefix matching the branch prefix (`feat:`, `fix:`,
`chore:`, `docs:`, `refactor:`).

### 8. Output summary

Print:
- Files changed
- Scenarios implemented
- Test results summary

## Constraints

- Implement only what the spec diff introduces — do not re-implement existing scenarios
- If the spec is ambiguous, ask before proceeding
- Follow all project conventions from CLAUDE.md
