---
name: plan
description: Planning skill — reads the capability spec, writes a technical plan (changes/<issue-id>/plan.md), and writes an ADR if an architectural decision is involved. Posts the plan to Linear. Optional step — skip for simple features and go straight to /code.
model: opus
disable-model-invocation: true
---

# /plan

Translates a capability spec into a technical plan. Use this for non-trivial features
where the approach warrants discussion before coding starts. Skip it for straightforward
implementations and go directly to `/code`.

## Input

`$ARGUMENTS` — a Linear issue ID (e.g. `MXB-7`).

## Steps

### 1. Parse issue ID

Extract the Linear issue identifier from `$ARGUMENTS`.

### 2. Locate the spec

Scan `specs/` to find the spec for this issue's feature:

```bash
ls specs/
```

Read `specs/<feature>/spec.md`. If no spec exists, tell the user:
"No spec found. Run `/spec <issue-id>` first, or run `/code <issue-id>` directly
if this is a bug fix."

### 3. Verify branch

Confirm you are on the correct feature branch. If not, check it out.

### 4. Enter plan mode

Use the `EnterPlanMode` tool to draft the technical approach before writing any files.
Present the proposed plan structure and file changes to the user for review.
Once approved, use `ExitPlanMode` to proceed.

### 5. Write changes/<issue-id>-<slug>/plan.md

Create the directory and plan file:

```
changes/<issue-id>-<slug>/plan.md
```

Use this format:

```md
# Plan: <Issue ID> — <Title>

**Spec:** `specs/<feature>/spec.md`
**Branch:** `<branch>`

## Approach

<Technical description of how the feature will be implemented. What components,
server functions, data flow, and state management are involved. 1-3 paragraphs.>

## File Changes

| File | Action | Notes |
|------|--------|-------|
| `src/features/<feature>/...` | create | ... |
| `src/routes/<feature>/...` | create | thin route, imports from feature |

## Decisions

<Key technical choices that are not obvious from the spec. Why this approach over
alternatives. Omit if nothing significant to record.>
```

### 6. Write ADR if warranted

An ADR is warranted when the plan involves:
- A new dependency
- A change to the established architecture
- A pattern being introduced for the first time
- A decision future developers would otherwise re-litigate

Count existing files in `docs/adr/` to determine the next number:

```bash
ls docs/adr/*.md 2>/dev/null | wc -l
```

Create `docs/adr/NNNN-<slug>.md` using MADR v3 format: Status, Context, Decision,
Consequences. Set status to "Accepted".

Skip if none of the above apply.

### 7. Simplify

Run `/simplify` to review the written plan and ADR for clarity, redundancy, and quality.
Fix any issues found before committing.

### 8. Commit

```bash
git add changes/ docs/adr/
git commit -m "docs: plan <issue-id>"
```

### 9. Post plan to Linear

Use `mcp__linear__save_comment` to post the full content of
`changes/<issue-id>-<slug>/plan.md` as a comment on the Linear issue.

If an ADR was written, append its path to the comment.

If MCP is unavailable, skip and note it in the output.

### 10. Output summary

Print:
- Plan path (`changes/<issue-id>-<slug>/plan.md`)
- ADR path if written
- Reminder: "Review the plan, then run `/code <issue-id>`."

## Constraints

- Do NOT write implementation code
- Do NOT write test stubs
- `changes/` artifacts are versioned but not living docs — do not update a plan after
  `/code` has started; create a new entry if the approach changes significantly
