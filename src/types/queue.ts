export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type ProcessingJob = {
  id: string;
  bookId: string;
  type: "PDF_PROCESSING";
  status: JobStatus;
  progress: number;
  error: string | null;
  pgBossJobId: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BookProcessingJobData = {
  bookId: string;
  chapters: { index: number; title: string; content: string }[];
};
