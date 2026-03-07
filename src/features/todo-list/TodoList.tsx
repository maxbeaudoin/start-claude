import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TodoItem from "./TodoItem";
import type { Todo } from "./types";

export default function TodoList() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [input, setInput] = useState("");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const text = input.trim();
		if (!text) return;
		setTodos((prev) => [
			...prev,
			{ id: crypto.randomUUID(), text, completed: false },
		]);
		setInput("");
	}

	function handleToggle(id: string) {
		setTodos((prev) =>
			prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
		);
	}

	function handleDelete(id: string) {
		setTodos((prev) => prev.filter((t) => t.id !== id));
	}

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Todo List</h1>
			<form onSubmit={handleSubmit} className="flex gap-2 mb-6">
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Add a new todo..."
					aria-label="New todo"
				/>
				<Button type="submit">Add</Button>
			</form>
			{todos.length === 0 ? (
				<p className="text-muted-foreground text-center py-8">
					No todos yet. Add one above!
				</p>
			) : (
				<div className="divide-y">
					{todos.map((todo) => (
						<TodoItem
							key={todo.id}
							todo={todo}
							onToggle={handleToggle}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
}
