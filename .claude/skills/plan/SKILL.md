---
name: plan
description: Reads the capability specs changed on this branch and writes a technical plan. Optional — skip for straightforward changes and go straight to /code.
model: opus
disable-model-invocation: true
---

# /plan

Translates spec changes on the current branch into a technical plan. Use for non-trivial
features where the approach warrants discussion before coding starts.

## Input

`$ARGUMENTS` — an optional issue ID or slug used to name the plan directory (e.g. `MXB-7`).
If empty, derives from the branch name.

## Steps

### 1. Discover changed specs

```bash
git diff main --name-only -- specs/
```

Read each changed spec file in full. Then read the diff to understand what is new:

```bash
git diff main -- specs/<feature>/spec.md
```

If no specs have changed on this branch, tell the user and stop.

### 2. Determine plan directory name

If `$ARGUMENTS` is provided: `changes/<arguments>-<feature>/plan.md`
Otherwise derive from branch name: `changes/<branch-slug>/plan.md`

### 3. Write plan.md

```md
# Plan: <Title>

**Spec:** `specs/<feature>/spec.md`
**Branch:** `<branch>`

## Approach

<Technical description. What components, server functions, data flow, state management.
1-3 paragraphs.>

## File Changes

| File | Action | Notes |
|------|--------|-------|
| `src/features/<feature>/...` | create | ... |

## Decisions

<Key technical choices and why this approach over alternatives. Omit if nothing significant.>
```

### 4. Write ADR if warranted

Warranted when the plan involves a new dependency, a change to established architecture,
a new pattern being introduced for the first time, or a decision future developers would
otherwise re-litigate.

```bash
ls docs/adr/*.md 2>/dev/null | wc -l
```

Create `docs/adr/NNNN-<slug>.md` using MADR v3 format. Skip if none of the above apply.

### 5. Simplify

Run `/simplify` to review the plan and ADR for clarity, redundancy, and quality.

### 6. Commit

```bash
git add changes/ docs/adr/
git commit -m "docs: plan <slug>"
```

### 7. Output summary

Print:
- Plan path
- ADR path if written
- Key decisions made

## Constraints

- Do NOT write implementation code
- Do NOT update a plan after `/code` has started — create a new entry if the approach changes
