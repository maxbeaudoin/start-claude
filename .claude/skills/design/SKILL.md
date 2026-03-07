---
name: design
description: Orchestrates the full design phase for a Linear issue — branches, runs /speckit.specify + /speckit.clarify + /speckit.plan + /speckit.tasks, writes ADR if needed, generates Playwright stubs, and syncs Linear to In Progress.
model: opus
disable-model-invocation: true
---

# /design

Thin orchestration skill. Fetches the Linear issue, sets up the branch, then
delegates to Spec Kit commands. Adds the ADR and Playwright TDD stubs that
Spec Kit doesn't handle, then syncs Linear.

## Input

`$ARGUMENTS` — a Linear issue ID (e.g., `MXB-6`) or full Linear issue URL.

## Steps

### 1. Parse issue ID

Extract the Linear issue identifier from `$ARGUMENTS`.

### 2. Fetch issue from Linear

Use `mcp__linear__get_issue` to fetch: title, description, labels, priority.
If unavailable, ask the user to provide issue details manually.

### 3. Derive branch name and create it

Choose prefix from labels: `fix/`, `docs/`, `chore/`, or `feat/` (default).
Format: `<prefix><issue-id-lowercase>-<slugified-title>`

```bash
git checkout main && git pull && git checkout -b <branch-name>
```

### 4. Run /speckit.specify

Invoke the `/speckit.specify` command, passing the Linear issue title and
description as the feature description input. Let Spec Kit produce
`specs/<branch-slug>/spec.md` using its template and workflow.

The spec will be created at `specs/###-<slug>/spec.md` following Spec Kit's
numbering convention — use the branch slug as the feature name.

### 5. Run /speckit.clarify (if needed)

After the spec is written, assess whether ambiguities remain that would block
implementation. If yes, invoke `/speckit.clarify` to resolve them before
proceeding. If the spec is clear, skip this step.

### 6. Write ADR (if needed)

An ADR is warranted when the issue involves a new dependency, an architecture
change, multiple valid approaches, or a precedent worth recording.

- Count existing files in `docs/adr/` for the next NNNN number
- Create `docs/adr/NNNN-<slug>.md` from `docs/adr/template.md`
- Status: "Proposed". Fill Context and Decision from the issue and spec.

Skip if none of the above apply.

### 7. Run /speckit.plan

Invoke `/speckit.plan` to produce the implementation plan
(`specs/###-<slug>/plan.md`). This translates the spec into a technical
approach: components, data flow, file changes, and complexity trade-offs.

### 8. Run /speckit.tasks

Invoke `/speckit.tasks` to produce `specs/###-<slug>/tasks.md` — a
dependency-ordered, actionable task list derived from the plan. These tasks
are what `/implement` executes.

### 9. Generate test stubs

Read the acceptance scenarios from the spec. For each scenario, choose the
innermost test layer that gives confident coverage:

**Playwright** (`e2e/<issue-id-lowercase>.spec.ts`) — for criteria involving
UI rendering, user interaction, or full-stack flows:

```ts
import { expect, test } from "@playwright/test";

test.describe("P1 — {User Story title}", () => {
	test.skip("{acceptance scenario verbatim}", async ({ page }) => {});
});

test.describe("P2 — {User Story title}", () => {
	test.skip("{acceptance scenario verbatim}", async ({ page }) => {});
});
```

**Vitest** (`src/__tests__/<issue-id>.test.ts`) — for criteria covering server
functions, API handlers, business logic, data transforms, or any behaviour that
does not require a browser. Use `it.todo()` stubs:

```ts
import { describe, it } from "vitest";

describe("{server function or module name}", () => {
	it.todo("{acceptance scenario or behaviour verbatim}");
});
```

A single feature may produce both files if it spans UI and server layers.
Only omit a file if no criteria fall in that layer.

### 10. Update Linear

1. Prepend a Design block to the issue description:
   ```
   ## Design

   Spec: `specs/<slug>/spec.md`
   Plan: `specs/<slug>/plan.md`
   Tasks: `specs/<slug>/tasks.md`
   Branch: `<branch-name>`
   ADR: `docs/adr/NNNN-<slug>.md` *(if applicable)*
   ```
2. Set state to **"In Progress"** via `mcp__linear__save_issue`.

If MCP unavailable, skip and note it in the output.

### 11. Commit

```bash
git add specs/ docs/adr/ e2e/ src/__tests__/
git commit -m "docs: add design for <issue-id>"
```

### 12. Output summary

Print branch name, files created, and Linear status. Remind:
"Review the design artifacts, then run `/implement <issue-id>`."

## Constraints

- Do NOT write production code
- Specs live in `specs/` and are permanent — never delete them
- Playwright stubs go in `e2e/`; Vitest stubs in `src/__tests__/`
- Delegate spec content to `/speckit.specify` — do not hand-craft it
- Delegate plan to `/speckit.plan` and tasks to `/speckit.tasks`
