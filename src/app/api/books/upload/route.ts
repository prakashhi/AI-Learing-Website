import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import { Book, BookChapter, UserBook } from "@/lib/db/init";
import { extractText } from "@/lib/text-extraction";
import { generateBatchEmbeddings } from "@/lib/embeddings";

const ALLOWED_TYPES = ["pdf", "epub", "docx", "md", "markdown"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_TYPES.includes(ext)) {
    return NextResponse.json(
      { error: `Unsupported file type: .${ext}. Allowed: pdf, epub, docx, md` },
      { status: 400 }
    );
  }

  const fileType = ext === "markdown" ? "md" : ext;
  const buffer = Buffer.from(await file.arrayBuffer());
  const bookId = crypto.randomUUID();
  const filePath = `${session.user.id}/${bookId}/${file.name}`;

  const { error: uploadError } = await supabaseAdmin().storage
    .from(STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: urlData } = supabaseAdmin().storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  const book = await Book.create({
    id: bookId,
    userId: session.user.id,
    title: file.name.replace(/\.[^/.]+$/, ""),
    author: null,
    fileType,
    fileUrl: urlData?.publicUrl || "",
    status: "PROCESSING",
    totalChapters: 0,
  });

  try {
    const { chapters } = await extractText(buffer, fileType);

    const chapterRecords = chapters.map((ch) => ({
      bookId: book.id,
      index: ch.index,
      title: ch.title,
      content: ch.content,
    }));

    const batchInput = chapters.map((ch) => ({
      index: ch.index,
      content: ch.content,
    }));

    let embeddings: { index: number; embedding: number[] }[] = [];
    try {
      embeddings = await generateBatchEmbeddings(batchInput);
    } catch {
      console.warn("⚠️ Embedding generation skipped");
    }

    for (const ch of chapterRecords) {
      const emb = embeddings.find((e) => e.index === ch.index);
      await BookChapter.create({
        ...ch,
        embedding: emb?.embedding || null,
        summary: null,
        keyPoints: null,
      });
    }

    await book.update({ status: "READY", totalChapters: chapterRecords.length });

    await UserBook.create({
      userId: session.user.id,
      bookId: book.id,
      currentChapterIndex: 0,
      learningMode: "STUDENT",
      learningGoal: null,
      dailyStudyMinutes: 30,
      completed: false,
    });

    return NextResponse.json({
      bookId: book.id,
      title: book.title,
      totalChapters: chapterRecords.length,
      status: "READY",
    });
  } catch (error: any) {
    await book.update({ status: "ERROR" });
    return NextResponse.json(
      { error: error.message || "Processing failed" },
      { status: 500 }
    );
  }
}
