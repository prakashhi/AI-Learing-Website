import { z } from "zod";

export const CreateNoteSchema = z.object({
  bookId: z.string().uuid("Invalid book ID"),
  chapterId: z.string().uuid("Invalid chapter ID"),
  content: z.string().min(1, "Content is required").max(5000),
  type: z.enum(["NOTE", "HIGHLIGHT", "BOOKMARK"]).default("NOTE"),
  pageRef: z.string().max(100).optional(),
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
