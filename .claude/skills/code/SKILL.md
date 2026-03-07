---
name: code
description: Implementation skill — reads the capability spec (and plan if present), implements the feature in src/features/<feature>/, writes tests from spec scenarios, runs quality checks, opens a PR, and posts the PR link to Linear.
model: sonnet
disable-model-invocation: true
---

# /code

Implements a feature from its spec and optional plan. Works from spec scenarios
directly — no pre-existing test stubs required.

## Input

`$ARGUMENTS` — a Linear issue ID (e.g. `MXB-7`).

## Steps

### 1. Parse issue ID

Extract the Linear issue identifier from `$ARGUMENTS`.

### 2. Read spec

Scan `specs/` to find the capability spec. If multiple specs exist, match by feature
name derived from the issue title or Linear description.

Read `specs/<feature>/spec.md` — this is the source of truth for what to build and
what tests to write.

If no spec exists, this is likely a bug fix or trivial change — proceed using the
Linear issue description as the requirement.

### 3. Read plan (if present)

Check for `changes/<issue-id>-*/plan.md`:

```bash
ls changes/<issue-id>-* 2>/dev/null
```

If found, read it for technical approach and file changes guidance.
If not found, derive the approach from the spec and codebase context.

### 4. Verify branch

Confirm you are on the correct feature branch. If not, check it out.

### 5. Implement in src/features/<feature>/

Follow the feature folder structure (ADR-0001):

```
src/features/<feature>/
  components/     # React components (if multiple, otherwise flat)
  <name>.tsx      # Main component (if simple)
  <name>.server.ts  # Server functions
  hooks.ts        # React hooks
  types.ts        # Types and Zod schemas
```

Route files go in `src/routes/` as a thin layer importing from the feature:

```ts
// src/routes/<feature>/index.tsx
import { FeatureComponent } from "@/features/<feature>"
```

Follow all project conventions:
- TanStack Start file-based routing for routes
- shadcn/ui ("new-york" style, neutral base, Lucide icons)
- Tailwind CSS v4 for styling
- `@/*` path alias for imports from `src/`
- Biome formatting: tabs, double quotes
- Zod for validation at system boundaries

### 6. Write tests from spec scenarios

For each scenario in `specs/<feature>/spec.md`, choose the innermost layer that
gives confident coverage:

**Playwright** (`e2e/<feature>.spec.ts`) — for scenarios involving UI rendering,
user interaction, or full-stack flows:

```ts
import { expect, test } from "@playwright/test";

test.describe("<Feature>", () => {
  test("<scenario name verbatim>", async ({ page }) => {
    await page.goto("/...");
    await page.waitForLoadState("networkidle");
    // implement scenario
  });
});
```

SSR patterns (required):
- `await page.waitForLoadState("networkidle")` after every `page.goto()`
- `pressSequentially("text")` instead of `fill("text")` for React controlled inputs

**Vitest** (`src/features/<feature>/<name>.test.ts`) — for scenarios covering server
functions, business logic, data transforms, or any behaviour without a browser:

```ts
import { describe, it, expect } from "vitest";

describe("<module name>", () => {
  it("<scenario name verbatim>", () => {
    // implement scenario
  });
});
```

A feature may produce both test files. Write tests for what the spec says — no more,
no less.

### 7. Run quality checks iteratively

```bash
bun run check:fix && bun run typecheck && bun run test && bun run test:e2e && bun run build
```

Fix failures before proceeding. Iterate until all checks pass.

### 8. Commit

```bash
git add src/ e2e/
git commit -m "<type>: <description> (<issue-id>)"
```

Use the conventional commit prefix matching the branch prefix (`feat:`, `fix:`,
`chore:`, `docs:`, `refactor:`).

### 9. Push and open PR

```bash
git push -u origin <branch-name>
gh pr create \
  --title "<type>: <description>" \
  --body "$(cat <<'EOF'
## Summary
<1-3 bullet points from spec purpose>

## Spec
`specs/<feature>/spec.md`

## Changes
<plan path if exists, otherwise brief description>

## Test Coverage
- [ ] All spec scenarios have passing tests
- [ ] Quality checks pass (biome, typecheck, test, build)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Capture the PR URL from the `gh pr create` output.

### 10. Post PR link to Linear

Use `mcp__linear__save_comment` to post the PR URL as a comment on the
Linear issue.

Then set the issue state to **In Review** via `mcp__linear__save_issue`.

If MCP is unavailable, skip and note it in the output.

### 11. Output summary

Print:
- PR URL
- Files changed
- Test results summary

## Constraints

- Only implement what the spec says — do NOT add unrequested behaviour
- Do NOT modify `specs/` or `docs/adr/` — they are permanent
- Do NOT modify `changes/` plan artifacts — they are versioned history
- If the spec is ambiguous, ask before proceeding
- Follow all project conventions from CLAUDE.md
