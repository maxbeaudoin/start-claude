# Feature Folder Architecture

## Status

Accepted

## Context

The project is a TanStack Start full-stack React application. Organizing files by
technical type (`components/`, `lib/`, `__tests__/`) scatters ownership — a change
to a single capability touches multiple directories, making scope and impact hard to
reason about. As the codebase grows this increases coupling and reduces cohesion.

## Decision

Organize source code by feature under `src/features/<feature>/`. Each feature folder
is a self-contained module that owns all code related to that capability:

- Components
- Server functions
- Hooks
- Types and schemas
- Unit tests (co-located: `<name>.test.ts`)

`src/routes/` remains a thin routing layer required by TanStack Start's file-based
router. Route files import from feature folders and contain no business logic.

Shared code with no single feature owner stays in `src/lib/`.

The spec system mirrors this structure: `specs/<feature>/spec.md` maps 1:1 to
`src/features/<feature>/`. When a new feature is specced, its folder is the
canonical name for both the spec and the implementation.

## Consequences

**Positive**
- High cohesion: all code for a capability lives together
- Low coupling: features are independent, changes are scoped to one folder
- Clear ownership: easy to find, delete, or extract a feature
- Spec alignment: capability names are stable across planning and code

**Negative**
- TanStack Start's routing constraint means route files are split from their feature folder
- Shared utilities without a single owner still require a judgement call (`src/lib/`)
