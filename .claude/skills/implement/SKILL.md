---
name: implement
description: Implement a feature from /design artifacts — executes tasks.md, fills Playwright stubs, runs quality checks, and opens a PR.
model: sonnet
disable-model-invocation: true
---

# /implement

Executes the implementation plan produced by `/design`. Follows `tasks.md`
task-by-task, fills Playwright stubs, runs quality checks, and opens a PR.

## Input

`$ARGUMENTS` — a Linear issue ID (e.g., `MXB-6`).

## Steps

### 1. Find design artifacts

Parse the issue ID from `$ARGUMENTS` and glob for `specs/<id>-*/spec.md`
(case-insensitive on the ID portion).

If no spec is found, tell the user:
"No design artifacts found for `<issue-id>`. Run `/design <issue-id>` first."

### 2. Read design artifacts

- Read `specs/<issue-id>-*/spec.md` — acceptance criteria and user stories
- Read `specs/<issue-id>-*/plan.md` — technical approach and file changes
- Read `specs/<issue-id>-*/tasks.md` — ordered implementation tasks
- Read `e2e/<issue-id-lowercase>.spec.ts` — Playwright stubs to fill
- Read the referenced ADR if one exists (`docs/adr/`)

If `plan.md` or `tasks.md` are missing, tell the user:
"Plan/tasks not found. Re-run `/design <issue-id>` to regenerate them."

### 3. Verify branch

Check that the current branch matches the expected feature branch. If not,
check it out:

```bash
git checkout <branch-name>
```

### 4. Execute tasks from tasks.md

Work through `tasks.md` in dependency order. For each task:

1. Implement the change described (create, modify, or delete files)
2. Follow project conventions:
   - TanStack Start file-based routing (`src/routes/`)
   - shadcn/ui components ("new-york" style, neutral base, CSS variables, Lucide icons)
   - Tailwind CSS v4 for styling
   - `@/*` path alias for imports from `src/`
   - Biome formatting: tabs, double quotes
   - Zod for validation at system boundaries
3. Run `bun run test` after each logical unit to catch regressions early

### 5. Fill test stubs and run iteratively — inner loop first

Work from the innermost layer outward. This gives the fastest feedback and
catches server-side bugs before running the slower E2E suite.

**Step A — Vitest (unit + integration):** If `src/__tests__/<issue-id>.test.ts`
exists, fill each `it.todo()` stub with a real test body, then run:

```bash
bun run test
```

Fix failures before moving to the next stub. These tests cover server
functions, API handlers, business logic, and data transforms — anything that
does not require a browser.

**Step B — Playwright (acceptance / E2E):** Once Vitest is green, fill each
`test.skip(...)` in `e2e/<issue-id-lowercase>.spec.ts` with a full test body,
then run:

```bash
bun run test:e2e
```

Fix failures before moving to the next scenario. Follow the SSR patterns in
CLAUDE.md (`waitForLoadState("networkidle")`, `pressSequentially()`).

### 6. Run quality checks

Once all tests pass:

```bash
bun run check:fix && bun run typecheck && bun run test && bun run test:e2e && bun run build
```

Iterate until all checks pass.

### 7. Commit implementation

Stage only implementation files — design artifacts are already committed:

```bash
git add <implementation-files>
git commit -m "feat: <description> (<issue-id>)"
```

Use the conventional commit prefix matching the branch prefix.

### 8. Push and open PR

```bash
git push -u origin <branch-name>
gh pr create --title "<type>: <description>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points from spec summary>

## Design Artifacts
- Spec: `specs/<issue-id>-<slug>/spec.md`
- Plan: `specs/<issue-id>-<slug>/plan.md`
- Tasks: `specs/<issue-id>-<slug>/tasks.md`
- ADR: `docs/adr/NNNN-<slug>.md` *(if applicable)*

## Test Coverage
- [ ] All acceptance criteria have passing Playwright tests
- [ ] Quality checks pass (biome, typecheck, test, build)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 9. Update Linear

1. Post a comment: `PR ready for review: <PR URL>`
2. Set state to **"In Review"** via `mcp__linear__save_issue`.

If MCP unavailable, skip and note it in the output.

### 10. Output summary

Print:
- PR URL
- Files changed
- Test results summary
- Reminder: "Review the PR and merge when ready."

## Constraints

- Only implement what is specified — do NOT add unrequested features
- Do NOT modify or delete `specs/` or `docs/adr/` — they are permanent
- If the spec is ambiguous, ask the user before proceeding
- Follow all project conventions from CLAUDE.md
