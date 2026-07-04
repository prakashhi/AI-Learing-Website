import { z } from "zod";

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

export const ChatMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(5000),
  bookId: z.string().uuid("Invalid book ID"),
  chapterId: z.string().uuid("Invalid chapter ID").optional(),
});

export type GenerateQuizInput = z.infer<typeof GenerateQuizSchema>;
export type QuizSubmitInput = z.infer<typeof QuizSubmitSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
