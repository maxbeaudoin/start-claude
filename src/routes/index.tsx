import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { addTodo, deleteTodo, getTodos, toggleTodo } from "@/server/todos";

export const Route = createFileRoute("/")({
	component: TodoApp,
	loader: async () => await getTodos(),
});

function TodoApp() {
	const router = useRouter();
	const todos = Route.useLoaderData();
	const [text, setText] = useState("");

	async function handleAdd() {
		if (!text.trim()) return;
		await addTodo({ data: text.trim() });
		setText("");
		router.invalidate();
	}

	async function handleToggle(id: string) {
		await toggleTodo({ data: id });
		router.invalidate();
	}

	async function handleDelete(id: string) {
		await deleteTodo({ data: id });
		router.invalidate();
	}

	return (
		<div className="flex justify-center py-12 px-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Todo</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleAdd();
							}}
							placeholder="What needs to be done?"
						/>
						<Button onClick={handleAdd} disabled={!text.trim()}>
							Add
						</Button>
					</div>
					{todos.length === 0 ? (
						<p className="text-muted-foreground text-sm text-center py-4">
							No todos yet
						</p>
					) : (
						<ul className="space-y-2">
							{todos.map((todo) => (
								<li
									key={todo.id}
									className="flex items-center gap-3 rounded-md border p-3"
								>
									<Checkbox
										checked={todo.completed}
										onCheckedChange={() => handleToggle(todo.id)}
									/>
									<span
										className={
											todo.completed
												? "flex-1 line-through text-muted-foreground"
												: "flex-1"
										}
									>
										{todo.text}
									</span>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(todo.id)}
										aria-label={`Delete ${todo.text}`}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
