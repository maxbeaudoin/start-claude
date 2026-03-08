import { createFileRoute } from "@tanstack/react-router";
import { TodoList } from "@/features/todo-list/TodoList";

export const Route = createFileRoute("/todos")({
	component: TodoList,
});
