import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import { Book, BookChapter, UserBook } from "@/lib/db/init";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const book = await Book.findOne({ where: { id, userId: session.user.id } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const chapters = await BookChapter.findAll({
      where: { bookId: id },
      order: [["index", "ASC"]],
      attributes: { exclude: ["embedding"] },
    });

    const userBook = await UserBook.findOne({
      where: { userId: session.user.id, bookId: id },
    });

    return NextResponse.json({
      book,
      chapters,
      progress: userBook,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      status: false,
      message: "SomeThing is wrong",
      error: e,
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const book = await Book.findOne({ where: { id, userId: session.user.id } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const filePath = `${session.user.id}/${book.id}/${book.title}.${book.fileType}`;
    try {
      await supabaseAdmin().storage.from(STORAGE_BUCKET).remove([filePath]);
    } catch {
      console.warn("⚠️ Could not remove file from storage");
    }

    await BookChapter.destroy({ where: { bookId: id } });
    await UserBook.destroy({ where: { bookId: id } });
    await book.destroy();

    return NextResponse.json({ success: true, message: "Book deleted" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      status: false,
      message: "SomeThing is wrong",
      error: e,
    });
  }
}
