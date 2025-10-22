"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { validateNoteContent, validateNoteTitle } from "@/lib/notes/validation";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateNoteInput,
  Note,
  NoteActionResult,
  UpdateNoteInput,
} from "@/types/notes";

/**
 * Get the current authenticated user
 * Returns null if no user is authenticated
 */
async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get all non-deleted notes for the current user
 * Sorted by pinned status (pinned first), then by updated date (most recent first)
 */
export async function getNotes(): Promise<NoteActionResult<Note[]>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to view notes",
      };
    }

    // Fetch notes from database
    const userNotes = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, user.id), eq(notes.isDeleted, false)))
      .orderBy(desc(notes.isPinned), desc(notes.updatedAt));

    return {
      success: true,
      data: userNotes.map((note) => ({
        id: note.id,
        userId: note.userId,
        title: note.title,
        content: note.content,
        isPinned: note.isPinned,
        isDeleted: note.isDeleted,
        deletedAt: note.deletedAt ? note.deletedAt.toISOString() : null,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return {
      success: false,
      error: "Failed to fetch notes. Please try again.",
    };
  }
}

/**
 * Get a single note by ID
 * Verifies ownership before returning
 */
export async function getNote(id: string): Promise<NoteActionResult<Note>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to view notes",
      };
    }

    // Fetch note from database
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!note) {
      return {
        success: false,
        error: "Note not found",
      };
    }

    return {
      success: true,
      data: {
        id: note.id,
        userId: note.userId,
        title: note.title,
        content: note.content,
        isPinned: note.isPinned,
        isDeleted: note.isDeleted,
        deletedAt: note.deletedAt ? note.deletedAt.toISOString() : null,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching note:", error);
    return {
      success: false,
      error: "Failed to fetch note. Please try again.",
    };
  }
}

/**
 * Create a new note
 */
export async function createNote(
  input: CreateNoteInput,
): Promise<NoteActionResult<Note>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to create a note",
      };
    }

    // Validate title
    const titleValidation = validateNoteTitle(input.title);
    if (!titleValidation.isValid) {
      return {
        success: false,
        error: titleValidation.error,
      };
    }

    // Validate content if provided
    const content = input.content || "";
    const contentValidation = validateNoteContent(content);
    if (!contentValidation.isValid) {
      return {
        success: false,
        error: contentValidation.error,
      };
    }

    // Create note in database
    const [newNote] = await db
      .insert(notes)
      .values({
        userId: user.id,
        title: input.title.trim(),
        content: content,
        isPinned: false,
        isDeleted: false,
      })
      .returning();

    // Revalidate the notes page
    revalidatePath("/notes");

    return {
      success: true,
      data: {
        id: newNote.id,
        userId: newNote.userId,
        title: newNote.title,
        content: newNote.content,
        isPinned: newNote.isPinned,
        isDeleted: newNote.isDeleted,
        deletedAt: newNote.deletedAt ? newNote.deletedAt.toISOString() : null,
        createdAt: newNote.createdAt.toISOString(),
        updatedAt: newNote.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error creating note:", error);
    return {
      success: false,
      error: "Failed to create note. Please try again.",
    };
  }
}

/**
 * Update an existing note
 * Validates ownership before updating
 */
export async function updateNote(
  id: string,
  input: UpdateNoteInput,
): Promise<NoteActionResult<Note>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to update notes",
      };
    }

    // Verify ownership
    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!existingNote) {
      return {
        success: false,
        error: "Note not found or you don't have permission to edit it",
      };
    }

    // Validate title if provided
    if (input.title !== undefined) {
      const titleValidation = validateNoteTitle(input.title);
      if (!titleValidation.isValid) {
        return {
          success: false,
          error: titleValidation.error,
        };
      }
    }

    // Validate content if provided
    if (input.content !== undefined) {
      const contentValidation = validateNoteContent(input.content);
      if (!contentValidation.isValid) {
        return {
          success: false,
          error: contentValidation.error,
        };
      }
    }

    // Build update object
    const updateData: Partial<typeof notes.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) {
      updateData.title = input.title.trim();
    }
    if (input.content !== undefined) {
      updateData.content = input.content;
    }
    if (input.isPinned !== undefined) {
      updateData.isPinned = input.isPinned;
    }

    // Update note in database
    const [updatedNote] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning();

    // Revalidate the notes page
    revalidatePath("/notes");

    return {
      success: true,
      data: {
        id: updatedNote.id,
        userId: updatedNote.userId,
        title: updatedNote.title,
        content: updatedNote.content,
        isPinned: updatedNote.isPinned,
        isDeleted: updatedNote.isDeleted,
        deletedAt: updatedNote.deletedAt
          ? updatedNote.deletedAt.toISOString()
          : null,
        createdAt: updatedNote.createdAt.toISOString(),
        updatedAt: updatedNote.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error updating note:", error);
    return {
      success: false,
      error: "Failed to update note. Please try again.",
    };
  }
}

/**
 * Soft delete a note
 * Sets isDeleted to true and deletedAt to current timestamp
 */
export async function deleteNote(id: string): Promise<NoteActionResult> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to delete notes",
      };
    }

    // Verify ownership
    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!existingNote) {
      return {
        success: false,
        error: "Note not found or you don't have permission to delete it",
      };
    }

    // Soft delete the note
    await db
      .update(notes)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id));

    // Revalidate the notes page
    revalidatePath("/notes");
    revalidatePath("/notes/trash");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting note:", error);
    return {
      success: false,
      error: "Failed to delete note. Please try again.",
    };
  }
}

/**
 * Toggle the pinned status of a note
 */
export async function togglePinNote(
  id: string,
): Promise<NoteActionResult<Note>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to pin notes",
      };
    }

    // Verify ownership and get current state
    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!existingNote) {
      return {
        success: false,
        error: "Note not found or you don't have permission to edit it",
      };
    }

    // Toggle pin status
    const [updatedNote] = await db
      .update(notes)
      .set({
        isPinned: !existingNote.isPinned,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();

    // Revalidate the notes page
    revalidatePath("/notes");

    return {
      success: true,
      data: {
        id: updatedNote.id,
        userId: updatedNote.userId,
        title: updatedNote.title,
        content: updatedNote.content,
        isPinned: updatedNote.isPinned,
        isDeleted: updatedNote.isDeleted,
        deletedAt: updatedNote.deletedAt
          ? updatedNote.deletedAt.toISOString()
          : null,
        createdAt: updatedNote.createdAt.toISOString(),
        updatedAt: updatedNote.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error toggling pin status:", error);
    return {
      success: false,
      error: "Failed to update note. Please try again.",
    };
  }
}

/**
 * Duplicate a note
 * Creates a copy with " - Copy" appended to the title
 */
export async function duplicateNote(
  id: string,
): Promise<NoteActionResult<Note>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to duplicate notes",
      };
    }

    // Verify ownership and get the note to duplicate
    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!existingNote) {
      return {
        success: false,
        error: "Note not found or you don't have permission to duplicate it",
      };
    }

    // Create duplicate with " - Copy" appended to title
    const duplicateTitle = `${existingNote.title} - Copy`;

    // Validate the new title length
    const titleValidation = validateNoteTitle(duplicateTitle);
    if (!titleValidation.isValid) {
      return {
        success: false,
        error:
          "Cannot duplicate: resulting title would be too long. Please shorten the original title first.",
      };
    }

    // Create the duplicate
    const [newNote] = await db
      .insert(notes)
      .values({
        userId: user.id,
        title: duplicateTitle,
        content: existingNote.content,
        isPinned: false,
        isDeleted: false,
      })
      .returning();

    // Revalidate the notes page
    revalidatePath("/notes");

    return {
      success: true,
      data: {
        id: newNote.id,
        userId: newNote.userId,
        title: newNote.title,
        content: newNote.content,
        isPinned: newNote.isPinned,
        isDeleted: newNote.isDeleted,
        deletedAt: newNote.deletedAt ? newNote.deletedAt.toISOString() : null,
        createdAt: newNote.createdAt.toISOString(),
        updatedAt: newNote.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error duplicating note:", error);
    return {
      success: false,
      error: "Failed to duplicate note. Please try again.",
    };
  }
}

/**
 * Get all deleted notes for the current user (trash view)
 */
export async function getTrashedNotes(): Promise<NoteActionResult<Note[]>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to view trash",
      };
    }

    // Fetch deleted notes from database
    const trashedNotes = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, user.id), eq(notes.isDeleted, true)))
      .orderBy(desc(notes.deletedAt));

    return {
      success: true,
      data: trashedNotes.map((note) => ({
        id: note.id,
        userId: note.userId,
        title: note.title,
        content: note.content,
        isPinned: note.isPinned,
        isDeleted: note.isDeleted,
        deletedAt: note.deletedAt ? note.deletedAt.toISOString() : null,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching trashed notes:", error);
    return {
      success: false,
      error: "Failed to fetch trashed notes. Please try again.",
    };
  }
}

/**
 * Restore a note from trash
 * Sets isDeleted to false and deletedAt to null
 */
export async function restoreNote(id: string): Promise<NoteActionResult<Note>> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to restore notes",
      };
    }

    // Verify ownership
    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!existingNote) {
      return {
        success: false,
        error: "Note not found or you don't have permission to restore it",
      };
    }

    // Restore the note
    const [restoredNote] = await db
      .update(notes)
      .set({
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();

    // Revalidate pages
    revalidatePath("/notes");
    revalidatePath("/notes/trash");

    return {
      success: true,
      data: {
        id: restoredNote.id,
        userId: restoredNote.userId,
        title: restoredNote.title,
        content: restoredNote.content,
        isPinned: restoredNote.isPinned,
        isDeleted: restoredNote.isDeleted,
        deletedAt: restoredNote.deletedAt
          ? restoredNote.deletedAt.toISOString()
          : null,
        createdAt: restoredNote.createdAt.toISOString(),
        updatedAt: restoredNote.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error restoring note:", error);
    return {
      success: false,
      error: "Failed to restore note. Please try again.",
    };
  }
}

/**
 * Permanently delete a note from the database
 * Cannot be undone
 */
export async function permanentlyDeleteNote(
  id: string,
): Promise<NoteActionResult> {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "You must be logged in to delete notes permanently",
      };
    }

    // Verify ownership
    const [existingNote] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    if (!existingNote) {
      return {
        success: false,
        error:
          "Note not found or you don't have permission to delete it permanently",
      };
    }

    // Hard delete the note
    await db.delete(notes).where(eq(notes.id, id));

    // Revalidate pages
    revalidatePath("/notes");
    revalidatePath("/notes/trash");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error permanently deleting note:", error);
    return {
      success: false,
      error: "Failed to delete note permanently. Please try again.",
    };
  }
}
