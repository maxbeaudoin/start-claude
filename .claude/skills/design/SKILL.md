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

Create test files in `src/__tests__/` — one test file per logical group of acceptance criteria.

Follow existing test patterns from `src/__tests__/app.test.ts`:
- Use Vitest (`describe`, `it`, `expect`)
- Use `@testing-library/react` for component tests
- Use the `@/*` path alias for imports
- Each test should map to a Gherkin acceptance criterion from the spec
- Tests MUST fail (reference not-yet-existing code, use `it.todo()` for tests that can't be structured yet)

### 9. Commit design artifacts

```bash
git add docs/ src/__tests__/
git commit -m "docs: add design for <issue-id>"
```

### 10. Output summary

Print:
- Branch name
- List of created files with paths
- Reminder: "Review the design artifacts, then run `/implement <issue-id>` to begin implementation."

## Constraints

- Do NOT write any production code (no files in `src/` except test files in `src/__tests__/`)
- Do NOT modify existing production files
- Keep specs focused — if the issue is large, note what's out of scope
- Use project conventions: tabs, double quotes, `@/*` alias, Vitest
