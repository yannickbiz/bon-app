export type Note = {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
