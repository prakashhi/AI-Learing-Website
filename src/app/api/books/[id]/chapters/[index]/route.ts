import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Book, BookChapter, Section } from "@/lib/db/init";
import { QueueService } from "@/services/QueueService";
import { QUEUES } from "@/queue/queues";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, index } = await params;
    const chapterIndex = parseInt(index, 10);
    if (Number.isNaN(chapterIndex)) {
      return NextResponse.json({ error: "Invalid chapter index" }, { status: 400 });
    }

    const book = await Book.findOne({ where: { id, userId: session.user.id } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const chapter = await BookChapter.findOne({
      where: { bookId: id, index: chapterIndex },
    });

    if (!chapter) {
      if (book.status === "PROCESSING") {
        return NextResponse.json({ status: "extracting" });
      }
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    if (chapter.status === "COMPLETED") {
      const sections = await Section.findAll({
        where: { chapterId: chapter.id },
        order: [["index", "ASC"]],
      });
      return NextResponse.json({
        status: "completed",
        chapter: {
          index: chapter.index,
          title: chapter.title,
          summary: chapter.summary,
          fullExplanation: chapter.fullExplanation,
          learningMaterial: chapter.learningMaterial,
        },
        sections,
      });
    }

    if (chapter.status === "PENDING" || chapter.status === "FAILED") {
      await QueueService.getInstance().add(
        QUEUES.BOOK_PROCESS_CHAPTER,
        { bookId: id, chapterIndex },
        { retryLimit: 2, retryDelay: 60, expireInSeconds: 30 },
      );
      return NextResponse.json({ status: "processing" });
    }

    return NextResponse.json({ status: "processing" });
  } catch (e) {
    console.error("Chapter fetch error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 500 },
    );
  }
}
