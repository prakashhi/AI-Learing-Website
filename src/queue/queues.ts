export const QUEUES = {
  BOOK_EXTRACT: "book-extract",
  BOOK_PROCESS_CHAPTER: "book-process-chapter",
} as const;

export type BookExtractData = {
  bookId: string;
};

export type BookProcessChapterData = {
  bookId: string;
  chapterIndex: number;
};
