import { getQueue } from "@/queue/pgboss";
import { QUEUES } from "@/queue/queues";
import { extractText, detectChapters } from "@/lib/text-extraction";
import { cleanText } from "@/lib/text-cleaning";
import { generateSectionEmbedding } from "@/lib/embeddings";
import { splitChapter } from "@/features/ai/services/SectionSplitter";
import { generateExplanation } from "@/features/ai/services/ExplanationGenerator";
import { verifyContent } from "@/features/ai/services/VerificationService";
import { generateLearningContent } from "@/features/ai/services/ContentGenerator";
import Book from "@/models/Book";
import BookChapter from "@/models/BookChapter";
import Section from "@/models/Section";
import ProcessingJob from "@/models/ProcessingJob";
import UserBook from "@/models/UserBook";
import { SuperBaseAdmin ,STORAGE_BUCKET} from "@/lib/supabase";

async function getFileBuffer(fileUrl: string): Promise<Buffer> {
  // Extract path relative to bucket
  const bucketIndex = fileUrl.indexOf(STORAGE_BUCKET);
  const filePath = bucketIndex >= 0
    ? fileUrl.slice(bucketIndex + STORAGE_BUCKET.length + 1)  // after "book-uploads/"
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

type BookProcessingJob = {
  data: { bookId: string };
  id: string;
  done: () => Promise<void>;
};

export function startBookProcessingWorker(): void {
  const boss = getQueue();
   boss.createQueue(QUEUES.BOOK_PROCESSING);

  (boss.work as any)(
    QUEUES.BOOK_PROCESSING,
    async (jobs: BookProcessingJob[]) => {
      try {
        const job = jobs[0];
        if (!job) return;

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
        const rawText = extraction.chapters.map((c) => c.content).join("\n\n");
        await processingJob.update({ progress: 10 });

         console.log("stage 1 Completed fo books")

        // Stage 2: Clean (10-15%)
        const cleaned = cleanText(rawText);
        await processingJob.update({ progress: 15 });

        console.log("Stage 2: Clean (10-15%)")

        // Stage 3: Detect Chapters (15-20%)
        const { chapters } = detectChapters(cleaned);
        await processingJob.update({ progress: 20 });
        await book.update({ totalChapters: chapters.length });

        console.log("Stage 3: Detect Chapters (15-20%)")

        // Stage 4: Process Each Chapter (20-80%)
        for (let i = 0; i < chapters.length; i++) {
          const existing = await BookChapter.findOne({
            where: { bookId, index: i } as any,
          });
          if (existing?.fullExplanation) {
            const pct = 20 + Math.round(((i + 1) / chapters.length) * 60);
            await processingJob.update({ progress: pct });
            continue;
          }

          const chapter = chapters[i];

          // 4a. Split into logical sections
          const sections = await splitChapter(chapter.content);

          // 4b. For each section: generate explanation + embedding
          let combinedExplanation = "";
          const sectionIds: string[] = [];
          for (const section of sections) {
            const explanation = await generateExplanation(section.text);
            combinedExplanation += explanation.explanation + "\n\n";

            const embedding = await generateSectionEmbedding(
              section.text,
              explanation.explanation,
            );

            const saved = await Section.create({
              chapterId: null,
              index: section.index,
              sectionText: section.text,
              explanation: explanation.explanation,
              concepts: explanation.concepts,
              examples: explanation.examples,
              definitions: explanation.definitions,
              embedding,
            });
            sectionIds.push(saved.id);
          }

          // 4c + 4d: Combine, verify, and fill gaps
          const verified = await verifyContent(
            chapter.content,
            combinedExplanation,
          );

          // 4e: Generate 17-point learning content
          const content = await generateLearningContent(
            verified.finalExplanation,
          );

          // 4f: Save BookChapter
          const savedChapter = await BookChapter.create({
            bookId,
            index: i,
            title: chapter.title,
            rawText: chapter.content,
            cleanText: chapter.content,
            fullExplanation: verified.finalExplanation,
            summary: content.chapterSummary,
            learningMaterial: content,
          });

          // Update sections with the chapterId
          for (const sectionId of sectionIds) {
            await Section.update(
              { chapterId: savedChapter.id },
              { where: { id: sectionId } as any },
            );
          }

          const pct = 20 + Math.round(((i + 1) / chapters.length) * 60);
          await processingJob.update({ progress: pct });
        }
        console.log("Stage 4: Process Each Chapter (20-80%)")

        // Stage 5: Finalize (80-100%)
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
        console.log("Stage 5: Finalize (80-100%)")
        await job.done();
      } catch (e) {
        console.log(e);
      }
    },
  );
}
