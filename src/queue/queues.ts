export const QUEUES = {
  BOOK_PROCESSING: "book-processing",
} as const;

export type BookProcessingData = {
  bookId: string;
  chapters: Array<{
    index: number;
    title: string;
    content: string;
  }>;
};
