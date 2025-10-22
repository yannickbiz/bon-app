"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Note } from "@/types/notes";
import { createNote } from "../actions";

type NoteInputProps = {
  onNoteCreated: (note: Note) => void;
};

export function NoteInput({ onNoteCreated }: NoteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Note title is required");
      return;
    }

    if (trimmedTitle.length > 100) {
      toast.error("Note title must not exceed 100 characters");
      return;
    }

    startTransition(async () => {
      const result = await createNote({ title: trimmedTitle });

      if (result.success && result.data) {
        onNoteCreated(result.data);
        setTitle("");
        setIsOpen(false);
        toast.success("Note created successfully!");
      } else {
        toast.error(result.error || "Failed to create note");
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new note</DialogTitle>
          <DialogDescription>
            Give your note a title. You can add content after creating it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {isPending ? "Creating..." : "Create Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
