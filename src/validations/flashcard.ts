import { z } from "zod";

export const ReviewFlashcardSchema = z.object({
  flashcardId: z.string().uuid("Invalid flashcard ID"),
  quality: z.number().int().min(0).max(5),
});

export type ReviewFlashcardInput = z.infer<typeof ReviewFlashcardSchema>;
