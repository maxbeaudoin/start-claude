---
name: design
description: Design a feature from a Linear issue — produces ADR, Spec Kit spec, and Playwright TDD stubs. Creates the feature branch and syncs Linear.
model: opus
disable-model-invocation: true
---

# /design

Design a feature from a Linear issue. Produces four artifacts: ADR (if needed), Spec Kit spec, Playwright E2E stubs, and a Linear issue update. Commits everything for human review before implementation.

## Input

`$ARGUMENTS` — a Linear issue ID (e.g., `LIN-123`) or full Linear issue URL.

## Steps

### 1. Parse issue ID

Extract the Linear issue identifier from `$ARGUMENTS`. Accept both short IDs (`LIN-123`) and full URLs.

### 2. Fetch issue details

Use the Linear MCP server to fetch the issue: title, description, labels, priority, project.
If unavailable, ask the user to provide issue details manually.

### 3. Derive branch name

Choose a prefix based on issue type/labels:
- Bug/fix → `fix/`
- Docs → `docs/`
- Chore/maintenance → `chore/`
- Everything else → `feat/`

Format: `<prefix><issue-id-lowercase>-<slugified-title>` (e.g., `feat/lin-123-user-auth`)

### 4. Create branch

```bash
git checkout main && git pull && git checkout -b <branch-name>
```

### 5. Write ADR (if needed)

An ADR is needed when the issue involves a new dependency, an architecture change, multiple valid approaches, or a precedent worth recording. Skip if none apply.

- Count existing files in `docs/adr/` to get the next number (NNNN)
- Create `docs/adr/NNNN-<slug>.md` from `docs/adr/template.md`
- Status: "Proposed". Fill Context and Decision from the issue.

### 6. Write Spec Kit spec

Create `specs/<issue-id-lowercase>-<slug>/spec.md` using the template at `.specify/templates/spec-template.md`.

Derive content from the Linear issue:
- **User Scenarios & Testing**: translate the issue requirements into prioritized user stories (P1 must-have, P2 should-have, P3 nice-to-have). Each story needs independently testable acceptance scenarios in Given/When/Then format.
- **Requirements**: functional requirements derived from the issue description
- **Success Criteria**: measurable outcomes that define done

**Acceptance scenario guidelines** — write each so it maps to a single Playwright test:
- One observable action + one clear outcome per scenario
- Avoid AND — split into two scenarios instead
- Use concrete values (`"displays 'No results found'"` not `"shows empty state"`)

### 7. Write Playwright E2E stubs

Create `e2e/<issue-id-lowercase>.spec.ts`:
- Group by user story using `test.describe()` matching the story title and priority
- One `test.skip()` per acceptance scenario — name matches verbatim

```ts
import { expect, test } from "@playwright/test";

test.describe("P1 — {User Story title}", () => {
  test.skip("{acceptance scenario}", async ({ page }) => {});
  test.skip("{acceptance scenario}", async ({ page }) => {});
});

test.describe("P2 — {User Story title}", () => {
  test.skip("{acceptance scenario}", async ({ page }) => {});
});
```

For pure logic with no UI (utility functions, data transformers), also create `src/__tests__/<issue-id>.test.ts` with Vitest `it.todo()` stubs. Skip if all criteria involve UI.

### 8. Update Linear issue

Using the Linear MCP server:

1. Update the issue description — prepend a Design block to the existing content:
   ```
   ## Design

   Spec: `specs/<issue-id-lowercase>-<slug>/spec.md`
   Branch: `<branch-name>`
   ADR: `docs/adr/NNNN-<slug>.md` *(if applicable)*
   ```
2. Set state to **"In Progress"** via `mcp__linear__save_issue`.

If the MCP server is unavailable, skip and note it in the output.

### 9. Commit design artifacts

```bash
git add docs/adr/ specs/ e2e/ src/__tests__/
git commit -m "docs: add design for <issue-id>"
```

### 10. Output summary

Print:
- Branch name
- Files created
- Linear issue moved to In Progress
- Reminder: "Review the design artifacts, then run `/implement <issue-id>` to begin implementation."

## Constraints

- Do NOT write production code (`src/` is off-limits except `src/__tests__/`)
- Do NOT modify existing production files
- Specs go in `specs/` using the Spec Kit template at `.specify/templates/spec-template.md`
- Playwright stubs go in `e2e/`; Vitest stubs go in `src/__tests__/`
