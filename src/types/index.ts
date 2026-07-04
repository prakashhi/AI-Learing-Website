import type { Book as _Book } from "./book";
import type { UserNote as _UserNote } from "./note";
import type { QuizAttempt as _QuizAttempt } from "./quiz";

export type { Book, BookChapter, BookStatus } from "./book";
export type { Section, SectionExplanation, VerificationResult, LearningContent } from "./chapter";
export type { Quiz, QuizAttempt, QuestionType, RevisionSchedule } from "./quiz";
export type { Flashcard, FlashcardReview, SpacedRepetition, LearningState } from "./flashcard";
export type { UserNote, NoteType } from "./note";
export type { SearchQuery, SearchResult, SectionSearchResult } from "./search";
export type { ProcessingJob, JobStatus, BookProcessingJobData } from "./queue";

export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LearningMode = "BEGINNER" | "STUDENT" | "INTERVIEW" | "ADVANCED";

export type UserBook = {
  id: string;
  userId: string;
  bookId: string;
  currentChapterIndex: number;
  learningMode: LearningMode;
  learningGoal: string | null;
  dailyStudyMinutes: number;
  completed: boolean;
  quizScores: any;
  revisionCount: number;
  weakTopics: any;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionType = "LESSON" | "QUIZ" | "REVISION" | "CHAT";

export type LearningSession = {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  duration: number;
  type: SessionType;
  createdAt: Date;
  updatedAt: Date;
};

export type MessageRole = "USER" | "AI";

export type ConversationMessage = {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string | null;
  role: MessageRole;
  content: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
};

export type LearningStats = {
  totalBooks: number;
  activeBook: string | null;
  currentChapter: string | null;
  overallProgress: number;
  completedChapters: number;
  remainingChapters: number;
  dailyGoalMinutes: number;
  studyStreak: number;
  quizAccuracy: number;
  weakTopics: string[];
  strongTopics: string[];
  totalLearningTime: number;
  upcomingRevision: number;
};

export type ServerActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export type Session = {
  user: SessionUser;
  expires: string;
};

export type CreateBookInput = Omit<_Book, "id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateUserBookInput = Partial<Omit<UserBook, "id" | "userId" | "bookId" | "createdAt" | "updatedAt">>;
export type CreateNoteInput = Omit<_UserNote, "id" | "userId" | "createdAt" | "updatedAt">;
export type CreateQuizAttemptInput = Omit<_QuizAttempt, "id" | "createdAt" | "updatedAt">;
