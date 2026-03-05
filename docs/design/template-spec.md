# {TITLE}

**Issue**: {ISSUE-ID}
**Date**: {YYYY-MM-DD}

## Summary

{One-paragraph description of what this feature/change does and why.}

## Motivation

{Why is this change needed? What problem does it solve? Reference the Linear issue context.}

## ADR Reference

{Link to related ADR (e.g., `../adr/NNNN-slug.md`) or "N/A" if no architectural decision is involved.}

## Acceptance Criteria

{Gherkin-format scenarios. Each scenario becomes a test case.}

```gherkin
Feature: {Feature name}

  Scenario: {Scenario name}
    Given {initial context}
    When {action}
    Then {expected outcome}

  Scenario: {Another scenario}
    Given {initial context}
    When {action}
    Then {expected outcome}
```

## Technical Approach

{How will this be implemented? Describe components, data flow, key decisions. Keep it concise — enough for a reviewer to understand the approach, not a line-by-line plan.}

## File Changes

| Action | Path | Description |
|--------|------|-------------|
| Create | `src/...` | {What this file does} |
| Modify | `src/...` | {What changes and why} |
| Delete | `src/...` | {Why this file is removed} |

## Out of Scope

- {What this issue explicitly does NOT cover}
- {Deferral of related but separate work}
