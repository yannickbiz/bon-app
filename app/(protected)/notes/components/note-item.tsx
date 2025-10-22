"use client";

import { Copy, MoreVertical, Pin, PinOff, Trash2 } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Note } from "@/types/notes";
import { deleteNote, duplicateNote, togglePinNote } from "../actions";

type NoteItemProps = {
  note: Note;
  isSelected: boolean;
  onNoteClick: (note: Note) => void;
  onNoteUpdated: (note: Note) => void;
  onNoteDeleted: (id: string) => void;
};

export function NoteItem({
  note,
  isSelected,
  onNoteClick,
  onNoteUpdated,
  onNoteDeleted,
}: NoteItemProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await togglePinNote(note.id);

      if (result.success && result.data) {
        onNoteUpdated(result.data);
        toast.success(result.data.isPinned ? "Note pinned" : "Note unpinned");
      } else {
        toast.error(result.error || "Failed to update note");
      }
    });
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await duplicateNote(note.id);

      if (result.success && result.data) {
        onNoteUpdated(result.data);
        toast.success("Note duplicated successfully!");
      } else {
        toast.error(result.error || "Failed to duplicate note");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteNote(note.id);

      if (result.success) {
        onNoteDeleted(note.id);
        setIsDeleteOpen(false);
        toast.success("Note moved to trash");
      } else {
        toast.error(result.error || "Failed to delete note");
      }
    });
  };

  const getPreview = (content: string) => {
    const preview = content.slice(0, 100);
    return preview.length < content.length ? `${preview}...` : preview;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffMs = now.getTime() - noteDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return noteDate.toLocaleDateString();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => onNoteClick(note)}
        className={`
          w-full text-left p-3 border rounded-lg cursor-pointer transition-colors
          hover:bg-accent
          ${isSelected ? "bg-accent border-primary" : "border-border"}
        `}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate flex-1">
            {note.title}
          </h3>
          <div className="flex items-center gap-1">
            {note.isPinned && (
              <Pin className="h-3.5 w-3.5 text-primary" fill="currentColor" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleTogglePin}
                  disabled={isPending}
                >
                  {note.isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDuplicate}
                  disabled={isPending}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteOpen(true);
                  }}
                  disabled={isPending}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {note.content && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {getPreview(note.content)}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDate(note.updatedAt)}
        </p>
      </button>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription>
              This note will be moved to trash. You can restore it later or
              delete it permanently.
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
