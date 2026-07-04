import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Book, BookChapter, UserBook } from "@/lib/db/init";
import { Op } from "sequelize";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const where: any = { userId: session.user.id };
    if (status) where.status = status;

    const { rows, count } = await Book.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const booksWithProgress = await Promise.all(
      rows.map(async (book) => {
        const ub = await UserBook.findOne({
          where: { userId: session.user.id, bookId: book.id },
        });
        return {
          ...book.toJSON(),
          progress: ub
            ? {
                currentChapterIndex: ub.currentChapterIndex,
                completed: ub.completed,
                learningMode: ub.learningMode,
                dailyStudyMinutes: ub.dailyStudyMinutes,
              }
            : null,
        };
      }),
    );

    return NextResponse.json({
      books: booksWithProgress,
      total: count,
      page,
      limit,
    });
  } catch (e) {
    console.log(e);
  }
}
