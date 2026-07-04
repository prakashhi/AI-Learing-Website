import { z } from "zod";

export const UploadBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().max(200).optional(),
}).passthrough();

export const UpdateUserBookSchema = z.object({
  currentChapterIndex: z.number().int().min(0).optional(),
  learningMode: z.enum(["BEGINNER", "STUDENT", "INTERVIEW", "ADVANCED"]).optional(),
  learningGoal: z.string().max(500).optional(),
  dailyStudyMinutes: z.number().int().min(5).max(480).optional(),
  completed: z.boolean().optional(),
});

export type UploadBookInput = z.infer<typeof UploadBookSchema>;
export type UpdateUserBookInput = z.infer<typeof UpdateUserBookSchema>;
