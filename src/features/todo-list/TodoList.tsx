import { useState } from "react";
import type { Todo } from "./types";

export function TodoList() {
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

	function toggleTodo(id: string) {
		setTodos((prev) =>
			prev.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo,
			),
		);
	}

	function deleteTodo(id: string) {
		setTodos((prev) => prev.filter((todo) => todo.id !== id));
	}

	return (
		<div className="max-w-md mx-auto mt-10 px-4">
			<h1 className="text-2xl font-bold mb-6">Todo List</h1>

			<form onSubmit={handleSubmit} className="flex gap-2 mb-6">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Add a new todo..."
					aria-label="New todo"
					className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					type="submit"
					className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
				>
					Add
				</button>
			</form>

			{todos.length === 0 ? (
				<p className="text-gray-500 text-sm">No todos yet. Add one above!</p>
			) : (
				<ul className="space-y-2">
					{todos.map((todo) => (
						<li
							key={todo.id}
							className="flex items-center gap-3 border border-gray-200 rounded px-3 py-2"
						>
							<input
								type="checkbox"
								checked={todo.completed}
								onChange={() => toggleTodo(todo.id)}
								aria-label={`Toggle ${todo.text}`}
								className="h-4 w-4 cursor-pointer"
							/>
							<span
								className={`flex-1 text-sm ${todo.completed ? "line-through text-gray-400" : ""}`}
							>
								{todo.text}
							</span>
							<button
								type="button"
								onClick={() => deleteTodo(todo.id)}
								aria-label={`Delete ${todo.text}`}
								className="text-red-500 hover:text-red-700 text-sm"
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
