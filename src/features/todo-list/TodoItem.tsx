import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "./types";

type Props = {
	todo: Todo;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
};

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
	return (
		<div className="flex items-center gap-3 py-2">
			<Checkbox
				id={todo.id}
				checked={todo.completed}
				onCheckedChange={() => onToggle(todo.id)}
			/>
			<label
				htmlFor={todo.id}
				className={`flex-1 cursor-pointer ${todo.completed ? "line-through text-muted-foreground" : ""}`}
			>
				{todo.text}
			</label>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onDelete(todo.id)}
				aria-label={`Delete ${todo.text}`}
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
