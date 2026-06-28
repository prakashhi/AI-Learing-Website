/**
 * Database Model Initialization & Associations
 * Sets up all model relationships for the AI Learning Platform
 */

import User from "@/models/User";
import Book from "@/models/Book";
import BookChapter from "@/models/BookChapter";
import UserBook from "@/models/UserBook";
import LearningSession from "@/models/LearningSession";
import Quiz from "@/models/Quiz";
import QuizAttempt from "@/models/QuizAttempt";
import Flashcard from "@/models/Flashcard";
import FlashcardReview from "@/models/FlashcardReview";
import ConversationMessage from "@/models/ConversationMessage";
import UserNote from "@/models/UserNote";
import RevisionSchedule from "@/models/RevisionSchedule";

export function initializeModels() {
  // User relationships
  User.hasMany(Book, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(UserBook, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(LearningSession, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(QuizAttempt, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(Flashcard, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(FlashcardReview, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(ConversationMessage, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(UserNote, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(RevisionSchedule, { foreignKey: "userId", onDelete: "CASCADE" });

  // Book relationships
  Book.belongsTo(User, { foreignKey: "userId" });
  Book.hasMany(BookChapter, { foreignKey: "bookId", onDelete: "CASCADE" });
  Book.hasMany(Quiz, { foreignKey: "bookId", onDelete: "CASCADE" });
  Book.hasMany(UserBook, { foreignKey: "bookId", onDelete: "CASCADE" });

  // BookChapter relationships
  BookChapter.belongsTo(Book, { foreignKey: "bookId" });
  BookChapter.hasMany(LearningSession, { foreignKey: "chapterId", onDelete: "CASCADE" });
  BookChapter.hasMany(Quiz, { foreignKey: "chapterId", onDelete: "CASCADE" });
  BookChapter.hasMany(Flashcard, { foreignKey: "chapterId", onDelete: "CASCADE" });
  BookChapter.hasMany(UserNote, { foreignKey: "chapterId", onDelete: "CASCADE" });
  BookChapter.hasMany(RevisionSchedule, { foreignKey: "chapterId", onDelete: "CASCADE" });

  // UserBook relationships
  UserBook.belongsTo(User, { foreignKey: "userId" });
  UserBook.belongsTo(Book, { foreignKey: "bookId" });

  // LearningSession relationships
  LearningSession.belongsTo(User, { foreignKey: "userId" });
  LearningSession.belongsTo(Book, { foreignKey: "bookId" });
  LearningSession.belongsTo(BookChapter, { foreignKey: "chapterId" });

  // Quiz relationships
  Quiz.belongsTo(Book, { foreignKey: "bookId" });
  Quiz.belongsTo(BookChapter, { foreignKey: "chapterId" });

  // QuizAttempt relationships
  QuizAttempt.belongsTo(User, { foreignKey: "userId" });
  QuizAttempt.belongsTo(Quiz, { foreignKey: "quizId" });

  // Flashcard relationships
  Flashcard.belongsTo(User, { foreignKey: "userId" });
  Flashcard.belongsTo(Book, { foreignKey: "bookId" });
  Flashcard.belongsTo(BookChapter, { foreignKey: "chapterId" });

  // FlashcardReview relationships
  FlashcardReview.belongsTo(Flashcard, { foreignKey: "flashcardId" });
  FlashcardReview.belongsTo(User, { foreignKey: "userId" });

  // ConversationMessage relationships
  ConversationMessage.belongsTo(User, { foreignKey: "userId" });
  ConversationMessage.belongsTo(Book, { foreignKey: "bookId" });
  ConversationMessage.belongsTo(BookChapter, { foreignKey: "chapterId" });

  // UserNote relationships
  UserNote.belongsTo(User, { foreignKey: "userId" });
  UserNote.belongsTo(Book, { foreignKey: "bookId" });
  UserNote.belongsTo(BookChapter, { foreignKey: "chapterId" });

  // RevisionSchedule relationships
  RevisionSchedule.belongsTo(User, { foreignKey: "userId" });
  RevisionSchedule.belongsTo(Book, { foreignKey: "bookId" });
  RevisionSchedule.belongsTo(BookChapter, { foreignKey: "chapterId" });
}

// Export all models
export { User, Book, BookChapter, UserBook, LearningSession, Quiz, QuizAttempt, Flashcard, FlashcardReview, ConversationMessage, UserNote, RevisionSchedule };
