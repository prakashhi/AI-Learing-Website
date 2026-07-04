export type BookStatus = "PROCESSING" | "READY" | "ERROR";

export type Book = {
  id: string;
  userId: string;
  title: string;
  author: string | null;
  fileType: string;
  fileUrl: string;
  status: BookStatus;
  totalChapters: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BookChapter = {
  id: string;
  bookId: string;
  index: number;
  title: string;
  rawText: string | null;
  cleanText: string | null;
  fullExplanation: string | null;
  summary: string | null;
  learningMaterial: any;
  createdAt: Date;
  updatedAt: Date;
};
