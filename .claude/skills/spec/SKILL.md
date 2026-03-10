---
name: spec
description: Writes or updates the capability spec for the current feature branch. Reads context from .claude/context.md or ARGUMENTS. Does not manage branches or post to Linear — those are /ship's responsibilities.
model: opus
disable-model-invocation: true
---

# /spec

Translates a feature description into a living capability specification. The spec is the
single source of truth for what the feature must do — no test stubs, no implementation.

## Input

`$ARGUMENTS` — required. The feature description as text. Use `@path` syntax to inline
a context file (e.g. `/spec @.claude/tmp/MXB-7.md`), or pass prose directly.

If empty, ask the user to describe the feature.

## Steps

### 1. Load context

Use `$ARGUMENTS` as the feature description.

### 2. Determine capability name

Scan `src/features/` for existing feature folders:

```bash
ls src/features/ 2>/dev/null || echo "(none)"
```

Map the description to an existing feature if it clearly enhances one. Otherwise
derive a short, lowercase, hyphenated name from the domain (e.g. `todo-list`,
`auth`, `user-profile`).

### 3. Write or update specs/<feature>/spec.md

If `specs/<feature>/spec.md` already exists, read it first, then update it to reflect
the new requirements — preserving existing scenarios that remain valid.

If it does not exist, create it:

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
```

Write one Requirement block per distinct behaviour. Scenarios must be concrete and testable.

### 4. Commit

```bash
git add specs/
git commit -m "docs: spec <feature>"
```

### 5. Output summary

Print:
- Feature name
- Spec path (`specs/<feature>/spec.md`)
- Whether the spec was created or updated
- Count of requirements and scenarios written

## Constraints

- Do NOT write implementation code
- Do NOT generate test stubs
- Specs in `specs/` are permanent — never delete them
