import { z } from "zod";

// Auth Validators
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const RegisterSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Book Upload Validator
export const UploadBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().max(200).optional(),
}).passthrough();

// UserBook Validator
export const UpdateUserBookSchema = z.object({
  currentChapterIndex: z.number().int().min(0).optional(),
  learningMode: z.enum(["BEGINNER", "STUDENT", "INTERVIEW", "ADVANCED"]).optional(),
  learningGoal: z.string().max(500).optional(),
  dailyStudyMinutes: z.number().int().min(5).max(480).optional(),
  completed: z.boolean().optional(),
});

// Chat Validator
export const ChatMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(5000),
  bookId: z.string().uuid("Invalid book ID"),
  chapterId: z.string().uuid("Invalid chapter ID").optional(),
});

// Quiz Validators
export const GenerateQuizSchema = z.object({
  bookId: z.string().uuid("Invalid book ID"),
  chapterId: z.string().uuid("Invalid chapter ID"),
  questionTypes: z.array(z.enum(["MCQ", "SHORT_ANSWER", "CODING", "SCENARIO"])).min(1).optional(),
  count: z.number().int().min(1).max(20).default(5),
});

export const QuizSubmitSchema = z.object({
  quizId: z.string().uuid("Invalid quiz ID"),
  answers: z.array(z.any()).min(1, "Answers are required"),
});

// Flashcard Validators
export const ReviewFlashcardSchema = z.object({
  flashcardId: z.string().uuid("Invalid flashcard ID"),
  quality: z.number().int().min(0).max(5),
});

// Note Validator
export const CreateNoteSchema = z.object({
  bookId: z.string().uuid("Invalid book ID"),
  chapterId: z.string().uuid("Invalid chapter ID"),
  content: z.string().min(1, "Content is required").max(5000),
  type: z.enum(["NOTE", "HIGHLIGHT", "BOOKMARK"]).default("NOTE"),
  pageRef: z.string().max(100).optional(),
});

// Book Search Validator
export const BookSearchSchema = z.object({
  bookId: z.string().uuid("Invalid book ID"),
  query: z.string().min(1, "Search query is required").max(200),
  limit: z.number().int().min(1).max(50).default(10),
});

// Revision Validator
export const RevisionCompleteSchema = z.object({
  scheduleId: z.string().uuid("Invalid schedule ID"),
  score: z.number().int().min(0).max(100).optional(),
});

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

// General Search
export const SearchSchema = z.object({
  query: z.string().max(200).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

// Type exports
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UploadBookInput = z.infer<typeof UploadBookSchema>;
export type UpdateUserBookInput = z.infer<typeof UpdateUserBookSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type GenerateQuizInput = z.infer<typeof GenerateQuizSchema>;
export type QuizSubmitInput = z.infer<typeof QuizSubmitSchema>;
export type ReviewFlashcardInput = z.infer<typeof ReviewFlashcardSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type BookSearchInput = z.infer<typeof BookSearchSchema>;
export type RevisionCompleteInput = z.infer<typeof RevisionCompleteSchema>;
