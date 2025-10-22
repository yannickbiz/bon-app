export type Note = {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteInput = {
  title: string;
  content?: string;
};

export type UpdateNoteInput = {
  title?: string;
  content?: string;
  isPinned?: boolean;
};

export type NoteActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
