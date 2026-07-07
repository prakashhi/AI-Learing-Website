import { z } from "zod";

export const ALLOWED_FILE_TYPES = ["pdf", "epub", "docx", "md", "markdown"] as const;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const UploadBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().max(200).optional(),
}).passthrough();

const fileTypeSchema = z.string().refine(
  (val) => (ALLOWED_FILE_TYPES as readonly string[]).includes(val),
  { message: `File type must be one of: ${ALLOWED_FILE_TYPES.join(", ")}` },
);

export const FileValidationSchema = z.object({
  fileType: fileTypeSchema,
  fileSize: z.number().max(MAX_FILE_SIZE, "File size must not exceed 50MB"),
});

export const UpdateUserBookSchema = z.object({
  currentChapterIndex: z.number().int().min(0).optional(),
  learningMode: z.enum(["BEGINNER", "STUDENT", "INTERVIEW", "ADVANCED"]).optional(),
  learningGoal: z.string().max(500).optional(),
  dailyStudyMinutes: z.number().int().min(5).max(480).optional(),
  completed: z.boolean().optional(),
});

export type UploadBookInput = z.infer<typeof UploadBookSchema>;
export type UpdateUserBookInput = z.infer<typeof UpdateUserBookSchema>;
export type FileValidationInput = z.infer<typeof FileValidationSchema>;
