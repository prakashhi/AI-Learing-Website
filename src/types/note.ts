export type NoteType = "NOTE" | "HIGHLIGHT" | "BOOKMARK";

export type UserNote = {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  content: string;
  type: NoteType;
  pageRef: string | null;
  createdAt: Date;
  updatedAt: Date;
};
