import User from "@/models/User";
import Book from "@/models/Book";
import BookChapter from "@/models/BookChapter";
import Section from "@/models/Section";
import UserBook from "@/models/UserBook";
import LearningSession from "@/models/LearningSession";
import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";
import Flashcard from "@/models/Flashcard";
import FlashcardReview from "@/models/FlashcardReview";
import ConversationMessage from "@/models/ConversationMessage";
import UserNote from "@/models/UserNote";
import ProcessingJob from "@/models/ProcessingJob";

export function initializeModels() {
  User.hasMany(Book, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(UserBook, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(LearningSession, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(QuizAttempt, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(Flashcard, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(FlashcardReview, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(ConversationMessage, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(UserNote, { foreignKey: "userId", onDelete: "CASCADE" });

  Book.belongsTo(User, { foreignKey: "userId" });
  Book.hasMany(BookChapter, { foreignKey: "bookId", onDelete: "CASCADE" });
  Book.hasMany(Quiz, { foreignKey: "bookId", onDelete: "CASCADE" });
  Book.hasMany(UserBook, { foreignKey: "bookId", onDelete: "CASCADE" });
  Book.hasMany(ProcessingJob, { foreignKey: "bookId", onDelete: "CASCADE" });

  BookChapter.belongsTo(Book, { foreignKey: "bookId" });
  BookChapter.hasMany(Section, { foreignKey: "chapterId", onDelete: "CASCADE" });
  BookChapter.hasMany(LearningSession, { foreignKey: "chapterId", onDelete: "CASCADE" });
  BookChapter.hasMany(Quiz, { foreignKey: "chapterId", onDelete: "CASCADE" });
  BookChapter.hasMany(Flashcard, { foreignKey: "chapterId", onDelete: "CASCADE" });
  BookChapter.hasMany(UserNote, { foreignKey: "chapterId", onDelete: "CASCADE" });

  Section.belongsTo(BookChapter, { foreignKey: "chapterId" });

  UserBook.belongsTo(User, { foreignKey: "userId" });
  UserBook.belongsTo(Book, { foreignKey: "bookId" });

  LearningSession.belongsTo(User, { foreignKey: "userId" });
  LearningSession.belongsTo(Book, { foreignKey: "bookId" });
  LearningSession.belongsTo(BookChapter, { foreignKey: "chapterId" });

  Quiz.belongsTo(Book, { foreignKey: "bookId" });
  Quiz.belongsTo(BookChapter, { foreignKey: "chapterId" });

  QuizAttempt.belongsTo(User, { foreignKey: "userId" });
  QuizAttempt.belongsTo(Quiz, { foreignKey: "quizId" });

  Flashcard.belongsTo(User, { foreignKey: "userId" });
  Flashcard.belongsTo(Book, { foreignKey: "bookId" });
  Flashcard.belongsTo(BookChapter, { foreignKey: "chapterId" });

  FlashcardReview.belongsTo(Flashcard, { foreignKey: "flashcardId" });

  ConversationMessage.belongsTo(User, { foreignKey: "userId" });
  ConversationMessage.belongsTo(Book, { foreignKey: "bookId" });
  ConversationMessage.belongsTo(BookChapter, { foreignKey: "chapterId" });

  UserNote.belongsTo(User, { foreignKey: "userId" });
  UserNote.belongsTo(Book, { foreignKey: "bookId" });
  UserNote.belongsTo(BookChapter, { foreignKey: "chapterId" });

  ProcessingJob.belongsTo(Book, { foreignKey: "bookId" });
}

export {
  User,
  Book,
  BookChapter,
  Section,
  UserBook,
  LearningSession,
  Quiz,
  QuizAttempt,
  Flashcard,
  FlashcardReview,
  ConversationMessage,
  UserNote,
  ProcessingJob,
};
