# Create a Basic TODO App

**Issue**: MXB-6
**Date**: 2026-03-05

## Summary

Replace the default landing page with a functional TODO application that allows users to add, complete, and delete tasks. The app uses TanStack Start server functions for data persistence and renders on the index route.

## Motivation

The current index route displays the default TanStack Start starter template. This issue replaces it with a working TODO app to serve as the project's core feature. The existing demo at `/demo/start/server-funcs` uses file-based storage and provides a reference pattern, but the new TODO app will be the primary experience on the home page with full CRUD operations.

## ADR Reference

N/A

## Acceptance Criteria

```gherkin
Feature: TODO App

  Scenario: View empty state
    Given no todos exist
    When the user visits the home page
    Then a message "No todos yet" is displayed
    And an input field with placeholder "What needs to be done?" is visible

  Scenario: Add a todo
    Given the user is on the home page
    When the user types "Buy groceries" in the input field
    And the user clicks the "Add" button
    Then "Buy groceries" appears in the todo list
    And the input field is cleared

  Scenario: Add a todo by pressing Enter
    Given the user is on the home page
    When the user types "Walk the dog" in the input field
    And the user presses Enter
    Then "Walk the dog" appears in the todo list

  Scenario: Cannot add empty todo
    Given the user is on the home page
    When the input field is empty
    Then the "Add" button is disabled

  Scenario: Toggle todo completion
    Given a todo "Buy groceries" exists
    When the user clicks the checkbox next to "Buy groceries"
    Then the todo is marked as completed with a strikethrough style

  Scenario: Uncheck a completed todo
    Given a completed todo "Buy groceries" exists
    When the user clicks the checkbox next to "Buy groceries"
    Then the todo is marked as not completed
    And the strikethrough style is removed

  Scenario: Delete a todo
    Given a todo "Buy groceries" exists
    When the user clicks the delete button for "Buy groceries"
    Then "Buy groceries" is removed from the todo list

  Scenario: Persist todos across page reloads
    Given the user has added "Buy groceries"
    When the user reloads the page
    Then "Buy groceries" is still in the todo list
```

## Technical Approach

- **Route**: Replace `src/routes/index.tsx` with the TODO app component
- **Server functions**: Create server functions using `createServerFn` for CRUD operations (get, add, toggle, delete) in a separate module `src/server/todos.ts`
- **Storage**: JSON file (`todos.json`) for persistence, matching the existing demo pattern
- **Data model**: `{ id: string, text: string, completed: boolean }`
- **UI**: Use shadcn/ui components (Checkbox, Button, Input, Card) with Tailwind styling
- **State**: Use TanStack Router loader for initial data; `router.invalidate()` after mutations

## File Changes

| Action | Path | Description |
|--------|------|-------------|
| Create | `src/server/todos.ts` | Server functions for CRUD operations on todos |
| Modify | `src/routes/index.tsx` | Replace starter template with TODO app UI |

## Out of Scope

- User authentication or multi-user support
- Categories, priorities, or due dates
- Drag-and-drop reordering
- Database storage (using JSON file for simplicity)
- Filtering or sorting todos
- Editing existing todo text
