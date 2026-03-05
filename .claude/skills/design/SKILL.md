---
name: design
description: Design a feature from a Linear issue — produces ADR, spec with Gherkin acceptance criteria, and failing TDD test stubs. Creates the feature branch.
model: opus
disable-model-invocation: true
---

# /design

Design a feature from a Linear issue. Creates a feature branch with design artifacts (ADR, spec, failing tests) for human review before implementation.

## Input

`$ARGUMENTS` — a Linear issue ID (e.g., `LIN-123`) or full Linear issue URL.

## Steps

### 1. Parse issue ID

Extract the Linear issue identifier from `$ARGUMENTS`. Accept both short IDs (`LIN-123`) and full URLs.

### 2. Fetch issue details

Use the Linear MCP server tools to fetch the issue:
- Title, description, labels, priority, project
- If the MCP server is unavailable, ask the user to provide issue details manually

### 3. Derive branch name

Based on the issue type/labels, choose a branch prefix:
- Bug/fix labels -> `fix/`
- Docs labels -> `docs/`
- Chore/maintenance labels -> `chore/`
- Everything else -> `feat/`

Format: `<prefix><issue-id-lowercase>-<slugified-title>` (e.g., `feat/lin-123-user-auth`)

### 4. Create branch

```bash
git checkout main && git pull && git checkout -b <branch-name>
```

### 5. Determine if ADR is needed

An ADR is needed when the issue involves:
- Adding a new dependency or tool
- An architecture change (new layer, service, pattern)
- Multiple valid approaches where the rationale should be recorded
- Setting a precedent for future work

If none apply, skip ADR creation.

### 6. Write ADR (if needed)

- Count existing files in `docs/adr/` to determine the next number (NNNN format, e.g., `0001`)
- Create `docs/adr/NNNN-<slug>.md` using the template at `docs/adr/template.md`
- Set status to "Proposed"
- Fill in Context and Decision based on the issue details

### 7. Write spec

Create `docs/design/<issue-id-lowercase>-<slug>/spec.md` using the template at `docs/design/template-spec.md`.

Fill in all sections:
- **Summary**: One-paragraph description derived from the issue
- **Motivation**: Why this change is needed (from issue description)
- **ADR Reference**: Link to the ADR if one was created, or "N/A"
- **Acceptance Criteria**: Gherkin-format scenarios (Given/When/Then) covering all requirements from the issue
- **Technical Approach**: How to implement — components, data flow, key decisions
- **File Changes**: Table of files to create/modify/delete with descriptions
- **Out of Scope**: What this issue explicitly does NOT cover

### 8. Write failing test files

Create two kinds of test stubs:

**A. Playwright E2E stubs** — for any acceptance criterion that involves UI rendering or user interaction.

Create `e2e/<issue-id-lowercase>.spec.ts`:
- Import from `@playwright/test`
- One `test.skip(...)` per Gherkin scenario
- Each stub name should be the scenario title verbatim

```ts
import { expect, test } from "@playwright/test";

test.skip("displays 'No todos yet' message when no todos exist", async ({ page }) => {});
test.skip("adds a todo when clicking the Add button", async ({ page }) => {});
// ...
```

**B. Vitest unit stubs** — only for acceptance criteria that test pure logic with no UI (e.g., a utility function, data transformer, or server function in isolation).

Create `src/__tests__/<issue-id>.test.ts` only if such criteria exist:
- Use Vitest (`describe`, `it`, `expect`)
- Use `it.todo()` for stubs

If all acceptance criteria involve UI interaction, skip the Vitest file entirely.

### 9. Update Linear issue

Using the Linear MCP server:

1. Update the issue description with a link to the spec and a summary of the acceptance criteria:
   ```
   ## Design

   Spec: `docs/design/<issue-id-lowercase>-<slug>/spec.md`
   Branch: `<branch-name>`

   ### Acceptance Criteria
   <paste the Gherkin scenarios verbatim>
   ```
2. Set the issue state to **"In Progress"** using `mcp__linear__save_issue` with `state: "In Progress"`.

If the MCP server is unavailable, skip this step and note it in the output summary.

### 10. Commit design artifacts

```bash
git add docs/ e2e/ src/__tests__/
git commit -m "docs: add design for <issue-id>"
```

### 11. Output summary

Print:
- Branch name
- List of created files with paths
- Confirmation that the Linear issue was moved to In Progress
- Reminder: "Review the design artifacts, then run `/implement <issue-id>` to begin implementation."

## Constraints

- Do NOT write any production code (no files in `src/` except test stubs in `src/__tests__/`)
- Do NOT modify existing production files
- Keep specs focused — if the issue is large, note what's out of scope
- Use project conventions: tabs, double quotes, `@/*` alias
- Playwright stubs go in `e2e/`; Vitest stubs go in `src/__tests__/`
