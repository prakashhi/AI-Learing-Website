import { z } from "zod";

export const BookSearchSchema = z.object({
  bookId: z.string().uuid("Invalid book ID"),
  query: z.string().min(1, "Search query is required").max(200),
  limit: z.number().int().min(1).max(50).default(10),
});

export const SearchSchema = z.object({
  query: z.string().max(200).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export const RevisionCompleteSchema = z.object({
  scheduleId: z.string().uuid("Invalid schedule ID"),
  score: z.number().int().min(0).max(100).optional(),
});

export type BookSearchInput = z.infer<typeof BookSearchSchema>;
export type RevisionCompleteInput = z.infer<typeof RevisionCompleteSchema>;
