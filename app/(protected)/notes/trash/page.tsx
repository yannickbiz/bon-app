"use client";

import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@/types/notes";
import {
  getTrashedNotes,
  permanentlyDeleteNote,
  restoreNote,
} from "../actions";

export default function TrashPage() {
  const router = useRouter();
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadTrashedNotes() {
      const result = await getTrashedNotes();
      if (result.success && result.data) {
        setTrashedNotes(result.data);
      } else {
        toast.error(result.error || "Failed to load trash");
      }
      setIsLoading(false);
    }

    loadTrashedNotes();
  }, []);

  const handleRestore = (noteId: string) => {
    startTransition(async () => {
      const result = await restoreNote(noteId);

      if (result.success) {
        setTrashedNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success("Note restored successfully");
      } else {
        toast.error(result.error || "Failed to restore note");
      }
    });
  };

  const handlePermanentDelete = () => {
    if (!noteToDelete) return;

    startTransition(async () => {
      const result = await permanentlyDeleteNote(noteToDelete);

      if (result.success) {
        setTrashedNotes((prev) => prev.filter((n) => n.id !== noteToDelete));
        setDeleteDialogOpen(false);
        setNoteToDelete(null);
        toast.success("Note permanently deleted");
      } else {
        toast.error(result.error || "Failed to delete note");
      }
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/notes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Trash</h1>
            <p className="text-sm text-muted-foreground">
              Notes deleted within the last 30 days
            </p>
          </div>
        </div>

        <Separator />

        {/* Trash Content */}
        {trashedNotes.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
            <p className="text-sm text-muted-foreground">
              Deleted notes will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trashedNotes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg space-y-3">
                <div>
                  <h3 className="font-semibold">{note.title}</h3>
                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {note.content.slice(0, 150)}
                      {note.content.length > 150 ? "..." : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Deleted {formatDate(note.deletedAt)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(note.id)}
                      disabled={isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setNoteToDelete(note.id);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Forever
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete note?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This note will be permanently
              deleted from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
