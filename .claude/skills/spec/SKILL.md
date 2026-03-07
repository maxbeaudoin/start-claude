---
name: spec
description: Spec-first skill — fetches a Linear issue, creates a feature branch, determines the capability name from the codebase, and writes or updates specs/<feature>/spec.md with requirements and GIVEN/WHEN/THEN scenarios. Posts the spec to Linear and sets the issue In Progress.
model: opus
disable-model-invocation: true
---

# /spec

Translates a Linear issue into a living capability specification. The spec is the
single source of truth for what the feature must do — no test stubs, no implementation.

## Input

`$ARGUMENTS` — a Linear issue ID (e.g. `MXB-7`) or full Linear issue URL.

## Steps

### 1. Parse issue ID

Extract the Linear issue identifier from `$ARGUMENTS`.

### 2. Fetch issue from Linear

Use `mcp__linear__get_issue` to fetch: title, description, labels, priority.
If unavailable, ask the user to provide issue details manually.

### 3. Create feature branch

Derive the branch prefix from labels: `fix/`, `docs/`, `chore/`, or `feat/` (default).
Format: `<prefix><issue-id-lowercase>-<slugified-title>`

```bash
git checkout main && git pull && git checkout -b <branch-name>
```

### 4. Determine capability name

Scan `src/features/` for existing feature folders:

```bash
ls src/features/ 2>/dev/null || echo "(none)"
```

Map the Linear issue to an existing feature if it clearly enhances one. Otherwise
derive a short, lowercase, hyphenated name from the issue's domain (e.g. `todo-list`,
`auth`, `user-profile`). The name must match what you would name the folder in code.

### 5. Write or update specs/<feature>/spec.md

If `specs/<feature>/spec.md` already exists, read it first, then update it to reflect
the new requirements introduced by this issue — preserving existing scenarios that
remain valid.

If it does not exist, create it using this format:

```md
# <Feature> Specification

## Purpose

<What this capability does and why it exists. 2-4 sentences.>

## Requirements

### <Requirement Name>

The system SHALL <requirement statement>.

#### Scenario: <scenario name>

- GIVEN <precondition>
- WHEN <action>
- THEN <expected outcome>

#### Scenario: <another scenario>

- GIVEN <precondition>
- WHEN <action>
- THEN <expected outcome>
```

Write one Requirement block per distinct behaviour. Write one Scenario per distinct
acceptance case. Scenarios must be concrete and testable — avoid vague language.

### 6. Commit

```bash
git add specs/
git commit -m "docs: spec <feature> (<issue-id>)"
```

### 7. Post spec to Linear

Use `mcp__linear__save_comment` to post the full content of `specs/<feature>/spec.md`
as a comment on the Linear issue.

Then set the issue state to **In Progress** via `mcp__linear__save_issue`.

If MCP is unavailable, skip and note it in the output.

### 8. Output summary

Print:
- Branch name
- Spec path (`specs/<feature>/spec.md`)
- Whether the spec was created or updated
- Reminder: "Review the spec, then run `/plan <issue-id>` or `/code <issue-id>`."

## Constraints

- Do NOT write implementation code
- Do NOT generate test stubs — scenarios in the spec are the source of truth
- If the issue is a bug fix with no spec changes needed, tell the user:
  "This looks like a bug fix — the spec already captures the intended behaviour.
  Run `/code <issue-id>` directly."
- Specs in `specs/` are permanent — never delete them
