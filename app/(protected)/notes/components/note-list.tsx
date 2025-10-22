"use client";

import { Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Note } from "@/types/notes";
import { EmptyState } from "./empty-state";
import { NoteInput } from "./note-input";
import { NoteItem } from "./note-item";

type NoteListProps = {
  initialNotes: Note[];
  selectedNoteId?: string;
  onNoteSelect: (note: Note) => void;
  onNotesChange?: (notes: Note[]) => void;
};

export function NoteList({
  initialNotes,
  selectedNoteId,
  onNoteSelect,
  onNotesChange,
}: NoteListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [optimisticNotes, setOptimisticNotes] = useOptimistic(
    initialNotes,
    (state: Note[], action: { type: string; note?: Note; id?: string }) => {
      switch (action.type) {
        case "add":
          return action.note ? [action.note, ...state] : state;
        case "update":
          return action.note
            ? state
                .map((n) => (n.id === action.note?.id ? action.note : n))
                .sort((a, b) => {
                  // Sort by pinned first, then by updated date
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  return (
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                  );
                })
            : state;
        case "delete":
          return state.filter((n) => n.id !== action.id);
        default:
          return state;
      }
    },
  );

  const handleNoteCreated = (note: Note) => {
    setOptimisticNotes({ type: "add", note });
    onNoteSelect(note);
    // Notify parent of the change
    if (onNotesChange) {
      onNotesChange([note, ...initialNotes]);
    }
  };

  const handleNoteUpdated = (note: Note) => {
    setOptimisticNotes({ type: "update", note });
    // Notify parent of the change
    if (onNotesChange) {
      const updatedNotes = initialNotes
        .map((n) => (n.id === note.id ? note : n))
        .sort((a, b) => {
          // Sort by pinned first, then by updated date
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
      onNotesChange(updatedNotes);
    }
  };

  const handleNoteDeleted = (id: string) => {
    setOptimisticNotes({ type: "delete", id });
    // Notify parent of the change
    if (onNotesChange) {
      onNotesChange(initialNotes.filter((n) => n.id !== id));
    }
  };

  // Filter notes based on search query
  const filteredNotes = optimisticNotes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  if (optimisticNotes.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 space-y-4">
          <NoteInput onNoteCreated={handleNoteCreated} />
        </div>
        <EmptyState onCreateNote={() => {}} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4">
        <NoteInput onNoteCreated={handleNoteCreated} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredNotes.length}{" "}
            {filteredNotes.length === 1 ? "note" : "notes"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/notes/trash")}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Trash
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No notes found matching "{searchQuery}"
          </p>
        ) : (
          filteredNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onNoteClick={onNoteSelect}
              onNoteUpdated={handleNoteUpdated}
              onNoteDeleted={handleNoteDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}
