"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Todo } from "@/types/todos";
import { deleteTodo, updateTodo } from "../actions";

type TodoItemProps = {
  todo: Todo;
  onTodoUpdated: (todo: Todo) => void;
  onTodoDeleted: (id: string) => void;
};

export function TodoItem({
  todo,
  onTodoUpdated,
  onTodoDeleted,
}: TodoItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleComplete = () => {
    startTransition(async () => {
      const result = await updateTodo(todo.id, {
        completed: !todo.completed,
      });

      if (result.success && result.data) {
        onTodoUpdated(result.data);
        toast.success(
          result.data.completed ? "Todo completed!" : "Todo marked as active",
        );
      } else {
        toast.error(result.error || "Failed to update todo");
      }
    });
  };

  const handleEdit = () => {
    const trimmedText = editText.trim();
    if (!trimmedText) {
      toast.error("Todo text cannot be empty");
      return;
    }

    if (trimmedText.length > 500) {
      toast.error("Todo text must not exceed 500 characters");
      return;
    }

    startTransition(async () => {
      const result = await updateTodo(todo.id, { text: trimmedText });

      if (result.success && result.data) {
        onTodoUpdated(result.data);
        setIsEditOpen(false);
        toast.success("Todo updated successfully!");
      } else {
        toast.error(result.error || "Failed to update todo");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTodo(todo.id);

      if (result.success) {
        onTodoDeleted(todo.id);
        setIsDeleteOpen(false);
        toast.success("Todo deleted successfully!");
      } else {
        toast.error(result.error || "Failed to delete todo");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={handleToggleComplete}
          disabled={isPending}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p
            className={`break-words ${
              todo.completed
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {todo.text}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditText(todo.text);
              setIsEditOpen(true);
            }}
            disabled={isPending}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>
              Make changes to your todo item below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-text">Todo Text</Label>
              <Input
                id="edit-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={500}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                {editText.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Todo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this todo? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
