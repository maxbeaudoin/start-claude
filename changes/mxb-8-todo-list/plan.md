# Plan: MXB-8 — Create a Simple Todo App

**Spec:** `specs/todo-list/spec.md`
**Branch:** `feat/mxb-8-create-a-simple-todo-app`

## Approach

The todo list will use React state (`useState`) to manage todos in-memory on the client. No database or server persistence is needed — the spec describes a simple client-side todo app. Each todo will be an object with `id`, `text`, and `completed` fields.

The feature will live in `src/features/todo-list/` following the feature-folder convention. It will contain a `TodoList` component that renders the input form, the list of todos (with toggle and delete controls), and an empty-state message. A thin route file at `src/routes/todos.tsx` will import and render the component.

Styling will use Tailwind CSS classes directly. shadcn/ui components (Button, Input, Checkbox) can be used for consistent styling if already available, otherwise plain Tailwind is sufficient to keep things simple.

## File Changes

| File | Action | Notes |
|------|--------|-------|
| `src/features/todo-list/TodoList.tsx` | create | Main component: input form, list rendering, toggle, delete, empty state |
| `src/features/todo-list/types.ts` | create | `Todo` type definition (`id`, `text`, `completed`) |
| `src/routes/todos.tsx` | create | Thin route file, imports `TodoList` from feature folder |

## Decisions

Client-side state only (no server persistence) — the spec makes no mention of persistence across page reloads, and YAGNI applies. If persistence is needed later, a server function + storage layer can be added without changing the component interface.
