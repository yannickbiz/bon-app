"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@/types/notes";
import { createNote, getNotes, updateNote } from "./actions";
import { EmptyState } from "./components/empty-state";
import { NoteEditor } from "./components/note-editor";
import { NoteList } from "./components/note-list";

// Debounce utility
// biome-ignore lint/suspicious/noExplicitAny: Generic utility needs any for flexibility
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const id = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(id);
    },
    [callback, delay, timeoutId],
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes on mount
  useEffect(() => {
    let mounted = true;

    async function loadNotes() {
      const result = await getNotes();
      if (!mounted) return;

      if (result.success && result.data) {
        setNotes(result.data);
        // Auto-select first note if available (only if nothing selected yet)
        setSelectedNote((current) => {
          if (!current && result.data && result.data.length > 0) {
            return result.data[0];
          }
          return current;
        });
      } else {
        toast.error(result.error || "Failed to load notes");
      }
      setIsLoading(false);
    }

    loadNotes();

    return () => {
      mounted = false;
    };
  }, []);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setSaveStatus("idle");
  };

  const saveNoteChanges = async (updates: {
    title?: string;
    content?: string;
  }) => {
    if (!selectedNote) return;

    setSaveStatus("saving");

    const result = await updateNote(selectedNote.id, updates);

    if (result.success && result.data) {
      // Update notes list
      setNotes((prev) =>
        prev.map((n) => (n.id === result.data?.id ? result.data : n)),
      );
      // Update selected note
      setSelectedNote(result.data);
      setSaveStatus("saved");
      setLastSaved(new Date());
    } else {
      setSaveStatus("error");
      toast.error(result.error || "Failed to save note");
    }
  };

  // Debounced save function (2 seconds)
  const debouncedSave = useDebounce(saveNoteChanges, 2000);

  const handleNoteChange = (updates: { title?: string; content?: string }) => {
    if (!selectedNote) return;

    // Optimistically update the selected note
    setSelectedNote((prev) => (prev ? { ...prev, ...updates } : null));

    // Trigger debounced save
    debouncedSave(updates);
  };

  const handleCreateNote = async () => {
    const result = await createNote({ title: "Untitled Note", content: "" });

    if (result.success && result.data) {
      // Add new note to the list
      setNotes((prev) => [result.data!, ...prev]);
      // Select the new note
      setSelectedNote(result.data);
      toast.success("Note created successfully");
    } else {
      toast.error(result.error || "Failed to create note");
    }
  };

  const handleNotesChange = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex">
        <div className="w-full md:w-[30%] border-r p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="hidden md:block flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        <EmptyState onCreateNote={handleCreateNote} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Left Panel - Note List */}
      <div className="w-full md:w-[30%] border-b md:border-b-0 md:border-r overflow-hidden flex flex-col">
        <NoteList
          initialNotes={notes}
          selectedNoteId={selectedNote?.id}
          onNoteSelect={handleNoteSelect}
          onNotesChange={handleNotesChange}
        />
      </div>

      {/* Right Panel - Note Editor */}
      <div className="flex-1 overflow-hidden">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onNoteChange={handleNoteChange}
            saveStatus={saveStatus}
            lastSaved={lastSaved}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Select a note to view and edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
