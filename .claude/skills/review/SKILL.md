---
name: review
description: PR review skill — fetches active GitHub Copilot review comments on a PR, critically evaluates each suggestion, implements those that improve code posture, and dismisses those that don't add value.
model: opus
disable-model-invocation: true
---

# /review

Processes active review comments on a pull request. Every suggestion is challenged
for relevance and value. Worthwhile suggestions are implemented; weak ones are
dismissed with a clear rationale.

## Input

`$ARGUMENTS` — a PR number (e.g. `42`) or a GitHub PR URL.

## Steps

### 1. Resolve PR number

Extract the PR number from `$ARGUMENTS`. If a URL is provided, parse the number
from it.

### 2. Fetch PR metadata

```bash
gh pr view <number> --json number,title,headRefName,baseRefName,state,url,owner,repository
```

Confirm the PR is open. If it is merged or closed, stop and tell the user.

Extract `owner` and `repo` name from the PR metadata (or from `gh repo view --json owner,name`)
for use in subsequent API calls.

Checkout the PR branch so edits can be committed:

```bash
gh pr checkout <number>
```

### 3. Fetch unresolved review threads

Use GraphQL to retrieve unresolved review threads (the REST endpoint does not expose
resolution status):

```bash
gh api graphql --paginate --field query='
  query($endCursor: String) {
    repository(owner: "<owner>", name: "<repo>") {
      pullRequest(number: <number>) {
        reviewThreads(first: 100, after: $endCursor) {
          pageInfo { hasNextPage, endCursor }
          nodes {
            id
            isResolved
            path
            line
            startLine
            comments(first: 50) {
              nodes { databaseId, body, author { login } }
            }
          }
        }
      }
    }
  }'
```

Filter to threads where:
- `isResolved` is `false`
- The first comment's `author.login` is `"copilot-pull-request-reviewer"`

Each thread node already contains its `id` (for resolution), `path`, `line`, and all
comment bodies. No separate grouping step is needed.

If there are no matching threads, print "No active Copilot review comments found."
and stop.

### 4. Evaluate and action each thread — one at a time

For every thread, perform the following evaluation loop before moving to the next.

#### 4a. Read the affected file and context

Use the first comment's `databaseId` from the GraphQL response as `<comment-id>` for
all REST calls (reactions, replies) in this thread.

```bash
gh api repos/{owner}/{repo}/pulls/comments/<comment-id> \
  --jq '{path, line, diff_hunk}'
```

Read the file at the commented path to understand the surrounding code.

#### 4b. Critically evaluate the suggestion

Ask the following questions:

1. **Is it correct?** Does the suggestion fix a real bug or address a genuine issue,
   or is it based on a misreading of the code?
2. **Does it improve code posture?** Security, correctness, readability, performance,
   or maintainability — does the change make the code measurably better?
3. **Is it in scope?** Does it touch what the PR is actually changing, or is it a
   general cleanup unrelated to the PR's intent?
4. **Does it align with project conventions?** Check CLAUDE.md — if the suggestion
   contradicts established patterns (Biome, Tailwind v4, TanStack patterns), it is
   likely wrong.
5. **Is it non-trivial noise?** Purely stylistic opinions, unnecessary complexity,
   premature abstractions, or suggestions that duplicate what the linter already
   enforces are noise.

A suggestion must pass at least questions 1 and 2 to be implemented.

#### 4c. Implement or dismiss

**If the suggestion is worth implementing:**

- Apply the change to the affected file.
- Run `bun run check:fix && bun run typecheck` to confirm nothing broke.
- React 👍 to the Copilot comment to signal acceptance and provide Copilot fine-tuning
  feedback:

```bash
gh api repos/{owner}/{repo}/pulls/comments/<comment-id>/reactions \
  --method POST --input - <<< '{"content":"+1"}'
```

- Resolve the thread using the thread node ID obtained in step 3:

```bash
gh api graphql \
  --field query='mutation { resolveReviewThread(input: { threadId: "<thread-node-id>" }) { thread { isResolved } } }'
```

**If the suggestion should be dismissed:**

- Do NOT touch the code.
- React 👎 to the Copilot comment to signal rejection and provide Copilot fine-tuning
  feedback:

```bash
gh api repos/{owner}/{repo}/pulls/comments/<comment-id>/reactions \
  --method POST --input - <<< '{"content":"-1"}'
```

- Reply to the comment thread with a concise, direct rationale:

```bash
gh api repos/{owner}/{repo}/pulls/<number>/comments \
  --method POST \
  --field body="Closing — <reason: e.g. 'the existing code is correct because...', 'this contradicts the project's Biome config', 'premature abstraction not warranted here'>." \
  --field in_reply_to=<comment-id>
```

Resolve the thread using the thread node ID obtained in step 3:

```bash
gh api graphql \
  --field query='mutation { resolveReviewThread(input: { threadId: "<thread-node-id>" }) { thread { isResolved } } }'
```

### 5. Run quality checks after all implementations

Once all comments have been actioned, run the full check suite if any changes were
made:

```bash
bun run check:fix && bun run typecheck && bun run test && bun run test:e2e && bun run build
```

Fix any failures before committing.

### 6. Commit and push (if changes were made)

```bash
git add -p   # stage only the files touched by review implementations
git commit -m "fix: address PR review comments (#<number>)"
git push
```

### 7. Output summary

Print a table:

| File | Line | Decision | Reason |
|------|------|----------|--------|
| `src/...` | 42 | Implemented | Fixed null-safety issue in ... |
| `src/...` | 78 | Dismissed | Stylistic preference; Biome handles formatting |

Then print the count: `X implemented, Y dismissed`.

## Constraints

- Challenge every suggestion — do not rubber-stamp Copilot output.
- Never implement a suggestion that contradicts project conventions (CLAUDE.md).
- Never implement a suggestion that introduces complexity without a clear benefit.
- If a suggestion is ambiguous, lean toward dismissal and explain why in the reply.
- Do not modify files outside the PR's changed file set unless a suggestion is
  clearly a bug fix that warrants it.
- Always reply to every comment thread — leave no thread without a response.
