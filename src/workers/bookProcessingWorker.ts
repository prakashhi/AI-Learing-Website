import { randomUUID } from "crypto";
import { QUEUES ,BookExtractData,BookProcessChapterData} from "@/queue/queues";
import { extractText } from "@/lib/text-extraction";
import { cleanText } from "@/lib/text-cleaning";
import { SectionSplitterService } from "@/features/ai/services/SectionSplitterService";
import { ExplanationGeneratorService } from "@/features/ai/services/ExplanationGeneratorService";
import { VerificationService } from "@/features/ai/services/VerificationService";
import { ContentGeneratorService } from "@/features/ai/services/ContentGeneratorService";
import Book from "@/models/Book";
import BookChapter from "@/models/BookChapter";
import Section from "@/models/Section";
import ProcessingJob from "@/models/ProcessingJob";
import UserBook from "@/models/UserBook";
import sequelize from "@/lib/db/sequelize";
import { SuperBaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import { QueueService } from "@/services/QueueService";

type ExtractJob = { id: string; data: { bookId: string } };
type ChapterJob = { id: string; data: { bookId: string; chapterIndex: number } };

async function getFileBuffer(fileUrl: string): Promise<Buffer> {
  const bucketIndex = fileUrl.indexOf(STORAGE_BUCKET);
  const filePath =
    bucketIndex >= 0
      ? fileUrl.slice(bucketIndex + STORAGE_BUCKET.length + 1)
      : fileUrl;
  const { data, error } = await SuperBaseAdmin()
    .storage.from(STORAGE_BUCKET)
    .download(filePath);
  if (error || !data) {
    throw new Error(`Failed to download file from storage: ${error?.message}`);
  }
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function handleBookExtract(job: ExtractJob): Promise<void> {
  const { bookId } = job.data;
  const book = await Book.findByPk(bookId);
  if (!book) throw new Error(`Book ${bookId} not found`);

  const processingJob = await ProcessingJob.findOne({
    where: { pgBossJobId: job.id },
  });

  await processingJob?.update({ status: "PROCESSING", startedAt: new Date() });

  const fileBuffer = await getFileBuffer(book.fileUrl);
  const extraction = await extractText(fileBuffer, book.fileType);

  const chapters = extraction.chapters.map((ch) => ({
    id: randomUUID(),
    bookId,
    index: ch.index ?? 0,
    title: ch.title ?? `Chapter`,
    rawText: ch.content,
    cleanText: cleanText(ch.content),
    status: "PENDING" as const,
    summary: null,
    fullExplanation: null,
    learningMaterial: null,
  }));

  await BookChapter.bulkCreate(chapters, { ignoreDuplicates: true });

  await book.update({ status: "READY", totalChapters: chapters.length });

  if (!processingJob) {
    await ProcessingJob.create({
      id: randomUUID(),
      bookId,
      type: "PDF_PROCESSING",
      status: "COMPLETED",
      progress: 100,
      pgBossJobId: job.id,
      completedAt: new Date(),
    });
  } else {
    await processingJob.update({
      status: "COMPLETED",
      progress: 100,
      completedAt: new Date(),
    });
  }

  await UserBook.findOrCreate({
    where: { userId: book.userId, bookId },
    defaults: { userId: book.userId, bookId, currentChapterIndex: 0 },
  });
}

async function handleBookProcessChapter(job: ChapterJob): Promise<void> {
  const { bookId, chapterIndex } = job.data;

  const chapter = await BookChapter.findOne({
    where: { bookId, index: chapterIndex },
  });
  if (!chapter) throw new Error(`Chapter ${bookId}:${chapterIndex} not found`);
  if (chapter.status === "COMPLETED") return;

  await chapter.update({ status: "PROCESSING", error: null });

  const content = chapter.cleanText || chapter.rawText || "";

  const sections = await SectionSplitterService.getInstance().split(content);

  let combinedExplanation = "";
  const sectionRecords: Section[] = [];

  for (const section of sections) {
    const explanation = await ExplanationGeneratorService.getInstance().generate(
      section.text,
    );
    combinedExplanation += explanation.explanation + "\n\n";

    const saved = await Section.create({
      chapterId: chapter.id,
      index: section.index,
      sectionText: section.text,
      explanation: explanation.explanation,
      concepts: explanation.concepts,
      examples: explanation.examples,
      definitions: explanation.definitions,
    });
    sectionRecords.push(saved);
  }

  const verified = await VerificationService.getInstance().verify(
    content,
    combinedExplanation,
  );

  const learningMaterial = await ContentGeneratorService.getInstance().generate(
    verified.finalExplanation,
  );

  await sequelize.transaction(async (tx) => {
    await chapter.update(
      {
        fullExplanation: verified.finalExplanation,
        summary: learningMaterial.chapterSummary,
        learningMaterial,
        status: "COMPLETED",
        error: null,
      },
      { transaction: tx },
    );

    if (sectionRecords.length > 0) {
      await Section.update(
        { chapterId: chapter.id },
        {
          where: { id: sectionRecords.map((s) => s.id) },
          transaction: tx,
        },
      );
    }
  });
}

export function startBookProcessingWorker(): void {
  const queue = QueueService.getInstance();

  queue.process<BookExtractData>(QUEUES.BOOK_EXTRACT, async (jobs) => {
    for (const job of jobs as ExtractJob[]) {
      try {
        await handleBookExtract(job);
      } catch (e) {
        console.error(`[extract] job ${job.id} failed:`, e);
        await ProcessingJob.update(
          {
            status: "FAILED",
            error: e instanceof Error ? e.message : String(e),
          },
          { where: { pgBossJobId: job.id } },
        ).catch(() => {});
      }
    }
  });

  queue.process<BookProcessChapterData>(
    QUEUES.BOOK_PROCESS_CHAPTER,
    async (jobs) => {
      for (const job of jobs as ChapterJob[]) {
        try {
          await handleBookProcessChapter(job);
        } catch (e) {
          console.error(`[chapter] job ${job.id} failed:`, e);
          await BookChapter.update(
            {
              status: "FAILED",
              error: e instanceof Error ? e.message : String(e),
            },
            {
              where: {
                bookId: job.data.bookId,
                index: job.data.chapterIndex,
              },
            },
          ).catch(() => {});
        }
      }
    },
    { localConcurrency: 3, batchSize: 3 },
  );
}
