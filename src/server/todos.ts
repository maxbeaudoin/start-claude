import fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Todo = {
	id: string;
	text: string;
	completed: boolean;
};

const filePath = "todos.json";

async function readTodos(): Promise<Todo[]> {
	return JSON.parse(
		await fs.promises
			.readFile(filePath, "utf-8")
			.catch(() => JSON.stringify([])),
	);
}

async function writeTodos(todos: Todo[]): Promise<void> {
	await fs.promises.writeFile(filePath, JSON.stringify(todos, null, 2));
}

export const getTodos = createServerFn({ method: "GET" }).handler(
	async () => await readTodos(),
);

export const addTodo = createServerFn({ method: "POST" })
	.inputValidator(z.string().min(1))
	.handler(async ({ data }) => {
		const todos = await readTodos();
		todos.push({ id: crypto.randomUUID(), text: data, completed: false });
		await writeTodos(todos);
	});

export const toggleTodo = createServerFn({ method: "POST" })
	.inputValidator(z.string())
	.handler(async ({ data: id }) => {
		const todos = await readTodos();
		const todo = todos.find((t) => t.id === id);
		if (todo) todo.completed = !todo.completed;
		await writeTodos(todos);
	});

export const deleteTodo = createServerFn({ method: "POST" })
	.inputValidator(z.string())
	.handler(async ({ data: id }) => {
		const todos = await readTodos();
		await writeTodos(todos.filter((t) => t.id !== id));
	});
