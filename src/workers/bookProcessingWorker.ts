import { getQueue } from "@/queue/pgboss";
import { QUEUES } from "@/queue/queues";
import { extractText } from "@/lib/text-extraction";
import sequelize from "@/lib/db/sequelize";
import { cleanText } from "@/lib/text-cleaning";
import { splitChapter } from "@/features/ai/services/SectionSplitter";
import { generateExplanation } from "@/features/ai/services/ExplanationGenerator";
import { verifyContent } from "@/features/ai/services/VerificationService";
import { generateLearningContent } from "@/features/ai/services/ContentGenerator";
import Book from "@/models/Book";
import BookChapter from "@/models/BookChapter";
import Section from "@/models/Section";
import ProcessingJob from "@/models/ProcessingJob";
import UserBook from "@/models/UserBook";
import { SuperBaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

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

async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: NodeJS.Timeout;
  const result = await Promise.race([
    fn(),
    new Promise<never>(
      (_, reject) =>
        (timer = setTimeout(
          () => reject(new Error(`Timed out after ${timeoutMs}ms`)),
          timeoutMs,
        )),
    ),
  ]);
  clearTimeout(timer!);
  return result;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; timeoutMs?: number },
): Promise<T> {
  const { maxRetries = 3, timeoutMs = 30000 } = options ?? {};
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn, timeoutMs);
    } catch (e) {
      lastError = e;
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

type BookProcessingJob = {
  data: { bookId: string };
  id: string;
  done: () => Promise<void>;
};

async function processBook(job: BookProcessingJob): Promise<void> {
  const { bookId } = job.data;
  const book = await Book.findByPk(bookId);
  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }

  const processingJob = await ProcessingJob.findOne({
    where: { pgBossJobId: job.id } as any,
  });
  if (!processingJob) {
    throw new Error(`ProcessingJob for job ${job.id} not found`);
  }

  await processingJob.update({
    status: "PROCESSING",
    startedAt: new Date(),
  });

  // Stage 1: Extract (0-10%)
  await processingJob.update({ progress: 5 });
  const fileBuffer = await getFileBuffer(book.fileUrl);
  const extraction = await extractText(fileBuffer, book.fileType);
  await processingJob.update({ progress: 10 });

  // Stage 2: Clean chapters in-place (10-20%)
  const chapters = extraction.chapters.map((ch) => ({
    ...ch,
    content: cleanText(ch.content),
  }));
  await book.update({ totalChapters: chapters.length });
  await processingJob.update({ progress: 20 });

  // Stage 3: Process Each Chapter (20-80%)
  const totalChapters = chapters.length;
  let chaptersCompleted = 0;
  const chapterErrors: Error[] = [];
  const concurrency = 3;

  const processOneChapter = async (chapter: typeof chapters[0], i: number) => {
    const existing = await BookChapter.findOne({
      where: { bookId, index: i } as any,
    });
    if (existing?.fullExplanation) {
      return;
    }

    const result = await sequelize.transaction(async (tx) => {
      const sections = await withRetry(() => splitChapter(chapter.content));

      let combinedExplanation = "";
      const sectionRecords: any[] = [];

      for (const section of sections) {
        const explanation = await withRetry(() =>
          generateExplanation(section.text),
        );
        combinedExplanation += explanation.explanation + "\n\n";

        const saved = await Section.create(
          {
            chapterId: null,
            index: section.index,
            sectionText: section.text,
            explanation: explanation.explanation,
            concepts: explanation.concepts,
            examples: explanation.examples,
            definitions: explanation.definitions,
          },
          { transaction: tx },
        );
        sectionRecords.push(saved);
      }

      const verified = await withRetry(() =>
        verifyContent(chapter.content, combinedExplanation),
      );

      const content = await withRetry(() =>
        generateLearningContent(verified.finalExplanation),
      );

      const savedChapter = await BookChapter.create(
        {
          bookId,
          index: i,
          title: chapter.title,
          rawText: chapter.content,
          cleanText: chapter.content,
          fullExplanation: verified.finalExplanation,
          summary: content.chapterSummary,
          learningMaterial: content,
        },
        { transaction: tx },
      );

      await Section.update(
        { chapterId: savedChapter.id },
        {
          where: { id: sectionRecords.map((s) => s.id) } as any,
          transaction: tx,
        },
      );

      return savedChapter;
    });

    if (!result) {
      throw new Error(`Failed to process chapter ${i}`);
    }
  };

  const queue = chapters.map((ch, i) => ({ ch, i }));
  await Promise.all(
    Array.from({ length: Math.min(concurrency, chapters.length) }, async () => {
      while (queue.length > 0) {
        const entry = queue.shift();
        if (!entry) break;
        try {
          await processOneChapter(entry.ch, entry.i);
        } catch (e) {
          chapterErrors.push(e instanceof Error ? e : new Error(String(e)));
        }
        chaptersCompleted++;
        const pct =
          20 + Math.round((chaptersCompleted / totalChapters) * 60);
        await processingJob.update({ progress: pct }).catch(() => {});
      }
    }),
  );

  if (chapterErrors.length > 0) {
    throw new AggregateError(
      chapterErrors,
      `${chapterErrors.length} of ${totalChapters} chapters failed`,
    );
  }

  // Stage 4: Finalize (80-100%)
  await book.update({ status: "READY" });
  await UserBook.create({
    userId: book.userId,
    bookId,
    currentChapterIndex: 0,
  });
  await processingJob.update({
    status: "COMPLETED",
    progress: 100,
    completedAt: new Date(),
  });

  await job.done();
}

export function startBookProcessingWorker(): void {
  const boss = getQueue();
  boss.createQueue(QUEUES.BOOK_PROCESSING);

  (boss.work as any)(
    QUEUES.BOOK_PROCESSING,
    async (jobs: BookProcessingJob[]) => {
      for (const job of jobs) {
        try {
          await processBook(job);
        } catch (e) {
          console.error(`Job ${job.id} failed:`, e);
          await ProcessingJob.update(
            {
              status: "FAILED",
              error: e instanceof Error ? e.message : String(e),
            },
            { where: { pgBossJobId: job.id } as any },
          ).catch(() => {});
        }
      }
    },
  );
}
