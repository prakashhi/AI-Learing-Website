import { randomUUID } from "crypto";
import { SuperBaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import Book from "@/models/Book";
import ProcessingJob from "@/models/ProcessingJob";
import { QueueService } from "@/services/QueueService";
import { QUEUES } from "@/queue/queues";

export interface UploadResult {
  bookId: string;
  status: "PROCESSING";
}

export async function uploadBook(
  userId: string,
  file: File,
  title: string,
  author?: string | null,
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = file.name.split(".").pop()?.toLowerCase() || "";

  const bookId = randomUUID();
  const filePath = `${userId}/${bookId}/${file.name}`;

  const { error: uploadError } = await SuperBaseAdmin()
    .storage.from(STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
  }

  const { data: urlData } = SuperBaseAdmin()
    .storage.from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  const book = await Book.create({
    id: bookId,
    userId,
    title,
    author: author || null,
    fileType,
    fileUrl: urlData?.publicUrl || filePath,
    status: "PROCESSING",
    totalChapters: 0,
  });
  console.log(book);

  if (!book) {
    throw new Error(`Failed to Create Book`);
  }

  const processingJob = await ProcessingJob.create({
    id: randomUUID(),
    bookId: book.dataValues.id,
    type: "PDF_PROCESSING",
    status: "QUEUED",
    progress: 0,
    pgBossJobId: null,
  });

  const pgBossJobId = await QueueService.getInstance().add(
    QUEUES.BOOK_EXTRACT,
    { bookId },
    { retryLimit: 2, retryDelay: 60, expireInSeconds: 30 },
  );

  await processingJob.update({ pgBossJobId });

  return { bookId: book.id, status: "PROCESSING" };
}
