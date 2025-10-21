"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/types/todos";
import { createTodo } from "../actions";

type TodoInputProps = {
  onTodoAdded: (todo: Todo) => void;
};

export function TodoInput({ onTodoAdded }: TodoInputProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const trimmedText = text.trim();
    if (!trimmedText) {
      toast.error("Todo text cannot be empty");
      return;
    }

    if (trimmedText.length > 500) {
      toast.error("Todo text must not exceed 500 characters");
      return;
    }

    startTransition(async () => {
      const result = await createTodo(trimmedText);

      if (result.success && result.data) {
        toast.success("Todo created successfully!");
        setText("");
        onTodoAdded(result.data);
      } else {
        toast.error(result.error || "Failed to create todo");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isPending}
        maxLength={500}
        className="flex-1"
      />
      <Button type="submit" disabled={isPending || !text.trim()}>
        {isPending ? (
          "Adding..."
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </>
        )}
      </Button>
    </form>
  );
}
