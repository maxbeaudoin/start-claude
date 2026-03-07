import { describe, it } from "vitest";

// Tests for the TODO app feature (MXB-6)
// These tests reference components and server functions that do not yet exist.

describe("TODO App", () => {
	describe("View empty state", () => {
		it.todo("displays 'No todos yet' message when no todos exist");

		it.todo("shows an input field with placeholder 'What needs to be done?'");
	});

	describe("Add a todo", () => {
		it.todo("adds a todo when clicking the Add button");

		it.todo("clears the input field after adding a todo");

		it.todo("adds a todo when pressing Enter");

		it.todo("disables the Add button when input is empty");
	});

	describe("Toggle todo completion", () => {
		it.todo("marks a todo as completed when clicking its checkbox");

		it.todo(
			"marks a completed todo as not completed when clicking its checkbox again",
		);
	});

	describe("Delete a todo", () => {
		it.todo("removes a todo when clicking its delete button");
	});
});

describe("Todo server functions", () => {
	it.todo("getTodos returns all todos");

	it.todo("addTodo creates a new todo with the given text");

	it.todo("toggleTodo flips the completed status of a todo");

	it.todo("deleteTodo removes a todo by id");
});
