---
name: kickoff
description: Turn a raw idea into a structured Linear issue by asking targeted questions and filling a standardized template compatible with /design.
model: opus
disable-model-invocation: true
---

# /kickoff

Turn a raw idea into a structured Linear issue through a guided Q&A. The resulting issue description follows a hybrid Opportunity + User Stories template that `/design` reads directly to produce Playwright stubs and a technical plan.

## Input

`$ARGUMENTS` — optional rough idea or feature description. If provided, use it as context when asking questions (don't ask the user to repeat it).

## Steps

### 1. Fetch team context

Use `mcp__linear__list_teams` to get the available team(s) so you can assign the issue correctly.

### 2. Ask the questions

Ask the following questions **one at a time**, in order. Wait for the user's answer before asking the next. Keep questions conversational — rephrase if the user's answer to a previous question already covers the next one.

```
1. What problem are we solving? Describe it in plain language.

2. Who experiences this problem? (e.g. end users, internal team, customers)

3. What's the business value of solving it? (e.g. retention, revenue, efficiency, developer experience)

4. Is there a reason to prioritize this now over other things?

5. Walk me through the most important user journey — what does the user
   do, and what should happen? (This becomes the P1 story.)

6. Any secondary journeys to capture? Or should they be explicitly out of scope?
   (These become P2/P3 stories, or feed the Out of Scope section.)

7. How will we know this is successful? Any measurable outcomes?

8. What are we explicitly NOT doing in this issue?
```

### 3. Derive a title

From the answers, synthesize a concise issue title (5–8 words, action-oriented, e.g. "Add email notification for failed payments").

### 4. Format the issue description

Using the answers, fill the following template exactly. Every section is mandatory — use "N/A" only if genuinely not applicable.

```markdown
## Opportunity

**Problem**: [What is broken or missing?]
**Who is affected**: [Which users / personas / teams?]
**Business value**: [Why does solving this matter?]
**Why now**: [What makes this timely or urgent?]

## User Stories

### P1 — [Title] *(must-have)*

[Plain language description of the core journey]

**Acceptance Criteria**:
- Given [state], When [action], Then [outcome]
- Given [state], When [action], Then [outcome]

### P2 — [Title] *(should-have)*

[Plain language description]

**Acceptance Criteria**:
- Given [state], When [action], Then [outcome]

### P3 — [Title] *(nice-to-have)*

[Plain language description — omit this section if nothing qualifies]

**Acceptance Criteria**:
- Given [state], When [action], Then [outcome]

## Success Criteria

- [Measurable outcome]
- [Measurable outcome]

## Out of Scope

- [Explicit exclusion]
```

**Acceptance Criteria guidelines** — write them so each one maps to a single Playwright test:
- One observable action and one clear outcome per criterion
- Avoid AND in a single criterion — split into two
- Prefer concrete values over vague ones ("displays 'No results found'" not "shows an empty state message")

### 5. Show a preview and confirm

Print the formatted title and description. Ask the user:

> "Does this look right? Reply 'yes' to create the Linear issue, or tell me what to adjust."

Iterate until confirmed.

### 6. Create the Linear issue

Use `mcp__linear__save_issue` with:
- `title`: the derived title
- `description`: the formatted template
- `team`: from step 1
- `state`: `"Todo"`

### 7. Output summary

Print:
- Issue identifier and URL
- Reminder: "Run `/design <issue-id>` when you're ready to design this."

## Constraints

- Do NOT create the issue until the user confirms the preview
- Each acceptance criterion must be independently testable by a single Playwright test
- Keep the Opportunity section product-focused — no implementation details
- P2/P3 sections are optional; omit if the user has nothing for them
