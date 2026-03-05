---
name: implement
description: Implement a feature from /design artifacts — writes code to pass TDD tests, runs quality checks, and opens a PR.
model: sonnet
disable-model-invocation: true
---

# /implement

Implement a feature from existing `/design` artifacts. Writes production code to pass TDD tests, runs quality checks, and opens a PR for review.

## Input

`$ARGUMENTS` — a Linear issue ID (e.g., `LIN-123`).

## Steps

### 1. Find design artifacts

Parse the issue ID from `$ARGUMENTS` and glob for `docs/design/<id>-*/spec.md` (case-insensitive on the ID portion).

If no spec is found, tell the user: "No design artifacts found for `<issue-id>`. Run `/design <issue-id>` first."

### 2. Read design artifacts

- Read the spec (`spec.md`)
- Read the referenced ADR if one exists
- Read all test files referenced in or related to the spec

### 3. Verify branch

Check that the current branch matches the expected feature branch. If not, check it out:

```bash
git checkout <branch-name>
```

### 4. Implement per file change manifest

Follow the spec's File Changes table. For each file:
- **Create**: Write new files following project conventions
- **Modify**: Read the existing file first, then edit
- **Delete**: Remove the file

Project conventions to follow:
- TanStack Start file-based routing (`src/routes/`)
- shadcn/ui components ("new-york" style, neutral base, CSS variables, Lucide icons)
- Tailwind CSS v4 for styling
- `@/*` path alias for imports from `src/`
- Biome formatting: tabs, double quotes
- Zod for validation where applicable

### 5. Implement E2E tests and run iteratively

Fill in the Playwright stubs from `e2e/<issue-id>.spec.ts`. For each scenario, write the full test body, then run:

```bash
bun run test:e2e
```

Fix failures before moving to the next scenario. The goal is to turn all skipped/failing tests green. Follow the SSR testing patterns in CLAUDE.md.

Also run the Vitest suite if there are unit stubs:

```bash
bun run test
```

### 6. Run quality checks

Once all tests pass, run the full quality suite:

```bash
bun run check:fix && bun run typecheck && bun run test && bun run test:e2e && bun run build
```

Fix any issues that arise. Iterate until all checks pass.

### 7. Commit implementation

Delete the spec now that the Playwright tests are the living specification:

```bash
rm -rf docs/design/<issue-id>-*/
```

Stage implementation files and the spec deletion together:

```bash
git add <implementation-files>
git rm -r docs/design/<issue-id>-*/
git commit -m "feat: <description> (<issue-id>)"
```

Use the appropriate conventional commit prefix (`feat:`, `fix:`, etc.) matching the branch prefix.

### 8. Push and open PR

```bash
git push -u origin <branch-name>
gh pr create --title "<type>: <description>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points from spec summary>

## ADR
<link to `docs/adr/NNNN-<slug>.md` if one exists, otherwise omit this section>

## Test Coverage
- [ ] All acceptance criteria have passing tests
- [ ] Quality checks pass (biome, typecheck, test, build)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 9. Update Linear issue

Using the Linear MCP server:

1. Post a comment on the issue with the PR link:
   ```
   PR ready for review: <PR URL>
   ```
2. Set the issue state to **"In Review"** using `mcp__linear__save_issue` with `state: "In Review"`.

If the MCP server is unavailable, skip this step and note it in the output summary.

### 10. Output summary

Print:
- PR URL
- Summary of files changed
- Test results summary
- Reminder: "Review the PR and merge when ready."

## Constraints

- Only implement what is specified in the spec — do NOT add unrequested features
- Do NOT modify design docs (`docs/design/`, `docs/adr/`)
- If the spec is ambiguous, ask the user for clarification before proceeding
- Follow all project conventions from CLAUDE.md
