# Plan: MXB-7 — Create a simple TODO app

**Spec:** `specs/todo-list/spec.md`
**Branch:** `feat/mxb-7-create-simple-todo-app`

## Approach

The todo list will be implemented as a client-side React feature using in-memory state (React `useState`). The spec describes a single-user, single-session todo list with no persistence requirements, so no server functions or database are needed at this stage.

A new feature folder `src/features/todo-list/` will contain all business logic: a `TodoList` component that manages the list state, a `TodoItem` component for individual items, and a shared `types.ts` for the `Todo` type. The route file at `src/routes/todos.tsx` will be a thin wrapper that imports and renders the feature component. The header will get a nav link to `/todos`.

UI will use shadcn/ui components (Input, Button, Checkbox, Card) styled with Tailwind CSS. Each todo item will have a checkbox for toggling completion (with strikethrough styling when complete) and a delete button. An empty-state message will display when no todos exist. The input form will reject empty submissions by checking trimmed input length before adding.

## File Changes

| File | Action | Notes |
|------|--------|-------|
| `src/features/todo-list/types.ts` | create | `Todo` type: `{ id: string; text: string; completed: boolean }` |
| `src/features/todo-list/TodoList.tsx` | create | Main component: form input, list rendering, empty state, state management via `useState` |
| `src/features/todo-list/TodoItem.tsx` | create | Single item: checkbox toggle, text with strikethrough, delete button |
| `src/routes/todos.tsx` | create | Thin route file, imports `TodoList` from feature folder |
| `src/components/Header.tsx` | modify | Add navigation link to `/todos` |

## Decisions

- **Client-side state only (no server functions):** The spec has no persistence or multi-user requirements. Using `useState` keeps the implementation simple and avoids premature infrastructure. Server functions can be added later when persistence is introduced.
- **No new dependencies:** shadcn/ui components (Input, Button, Checkbox) and Tailwind cover all UI needs. If any shadcn components are not yet installed, they will be added via `bunx shadcn add`.
- **`crypto.randomUUID()` for IDs:** Simple, built-in, no extra dependency needed for generating unique todo IDs.
