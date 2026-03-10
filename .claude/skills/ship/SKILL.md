---
name: ship
description: End-to-end delivery skill — takes a Linear issue ID or a description, runs the appropriate pipeline (spec → plan → code → review), and handles all git and Linear orchestration.
model: opus
disable-model-invocation: true
---

# /ship

Orchestrates the full delivery pipeline for a single issue. Handles git, Linear, PR
creation, and skill sequencing. The pipeline skills (/spec, /plan, /code, /review)
handle only their capability work — everything else lives here.

## Input

`$ARGUMENTS` — one of:
- A Linear issue ID (e.g. `MXB-7`) — fetches full context from Linear
- A prose description (e.g. `"add dark mode toggle to settings"`) — used directly

## Steps

### 1. Load context

**If `$ARGUMENTS` looks like a Linear issue ID** (matches pattern `[A-Z]+-\d+`):

Fetch from Linear using `mcp__linear__get_issue`: title, description, labels, priority.
If Linear is unavailable, ask the user to provide the details manually.

```bash
mkdir -p .claude/tmp
```

Write `.claude/tmp/<issue-id>.md` (e.g. `.claude/tmp/MXB-7.md`):

```md
# <Issue ID>: <Title>

## Description
<issue description>

## Labels
<labels>

## Priority
<priority>
```

**If `$ARGUMENTS` is prose:**

Derive a short slug from the description (e.g. `dark-mode-toggle`).
Write `.claude/tmp/<slug>.md`:

```md
# <slug>

## Description
<$ARGUMENTS verbatim>
```

### 2. Determine pipeline type

Inspect labels (or prose prefix) to classify the issue:

| Type | Criteria | Branch prefix | Pipeline |
|------|----------|---------------|----------|
| Bug fix | label `bug`/`fix`, or prose starts with `fix:` | `fix/` | code only |
| Docs | label `docs`, or prose starts with `docs:` | `docs/` | code only |
| Chore | label `chore` | `chore/` | code only |
| Feature | anything else | `feat/` | spec → (plan?) → code |

For features, plan is warranted when the issue description suggests: multiple new
behaviours, a new dependency, or an architectural decision. Skip plan for straightforward
additions.

### 3. Create feature branch

```bash
git checkout main && git pull
git checkout -b <prefix><issue-id-lowercase>-<slugified-title>
```

For prose input without an issue ID, omit the issue ID segment.

### 4. Run /spec (features only)

Spawn a subagent:

> Read `.claude/skills/spec/SKILL.md` and execute it with ARGUMENTS=`@.claude/tmp/<context-file>`.
> Report the feature name and spec path when done.

Wait for completion before proceeding.

### 5. Run /plan (features only, if warranted)

Spawn a subagent:

> Read `.claude/skills/plan/SKILL.md` and execute it with ARGUMENTS=`<issue-id-or-slug>`.
> Business context is available at `.claude/tmp/<context-file>` if needed.
> Report the plan path when done.

### 6. Run /code

Spawn a subagent:

> Read `.claude/skills/code/SKILL.md` and execute it with ARGUMENTS=`@.claude/tmp/<context-file>`.
> Report files changed, scenarios implemented, and test results when done.

Wait for completion before proceeding.

### 7. Push and open PR

```bash
git push -u origin <branch-name>
```

Create the PR using the skill script, piping the body via heredoc:

```bash
${CLAUDE_SKILL_DIR}/scripts/create-pr.sh "<type>: <title>" << 'EOF'
## Summary
<1-3 bullet points from the issue description or spec purpose>

## Spec
`specs/<feature>/spec.md`

## Changes
<plan path if exists, otherwise brief description>

## Test Coverage
- [ ] All new spec scenarios have passing tests
- [ ] Quality checks pass (biome, typecheck, test, build)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```

Capture the PR URL and number from output (e.g. `gh pr view --json number,url`).

### 8. Post to Linear

Use `mcp__linear__save_comment` to post the PR URL on the Linear issue.
Use `mcp__linear__save_issue` to set the issue state to **In Review**.
If Linear is unavailable or input was prose, skip and note "Linear update skipped" in the final summary.

### 9. Wait for Copilot review

Poll until GitHub Copilot has submitted a review or 20 minutes elapse:

```bash
for i in $(seq 1 10); do
  count=$(gh pr view <number> --json reviews \
    --jq '[.reviews[] | select(.author.login == "copilot-pull-request-reviewer")] | length')
  [ "$count" -gt 0 ] && break
  sleep 120
done
```

If no Copilot review arrives within the timeout, note it and skip /review.

### 10. Run /review

Spawn a subagent:

> Read `.claude/skills/review/SKILL.md` and execute it with ARGUMENTS=<pr-number>.
> Report the count of implemented and dismissed suggestions when done.

### 11. Output summary

Print:
- Branch name
- PR URL
- Pipeline steps that ran
- Review outcome (implemented / dismissed counts, or skipped)

## Constraints

- One issue per /ship invocation — do not attempt to batch multiple issues
- If any step fails, stop and report the failure clearly before the user decides how to proceed
- When running non-interactively (e.g. via cron with `-p`): make the most reasonable assumption on any ambiguity, document the assumption in the output, and proceed — do not stop to ask
