// User Types
export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Book Types
export type BookStatus = "PROCESSING" | "READY" | "ERROR";

export type Book = {
  id: string;
  userId: string;
  title: string;
  author: string | null;
  fileType: string;
  fileUrl: string;
  status: BookStatus;
  totalChapters: number;
  createdAt: Date;
  updatedAt: Date;
};

// BookChapter Types
export type BookChapter = {
  id: string;
  bookId: string;
  index: number;
  title: string;
  content: string;
  embedding: number[] | null;
  summary: string | null;
  keyPoints: any;
  createdAt: Date;
  updatedAt: Date;
};

// UserBook Types
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
  createdAt: Date;
  updatedAt: Date;
};

// LearningSession Types
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

// Quiz Types
export type QuestionType = "MCQ" | "SHORT_ANSWER" | "CODING" | "SCENARIO";

export type Quiz = {
  id: string;
  bookId: string;
  chapterId: string;
  type: QuestionType;
  questions: any;
  createdAt: Date;
  updatedAt: Date;
};

// QuizAttempt Types
export type QuizAttempt = {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: any;
  feedback: any;
  weakTopics: any;
  strongTopics: any;
  createdAt: Date;
  updatedAt: Date;
};

// Flashcard Types
export type Flashcard = {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  front: string;
  back: string;
  difficulty: number;
  createdAt: Date;
  updatedAt: Date;
};

// FlashcardReview Types
export type FlashcardReview = {
  id: string;
  flashcardId: string;
  userId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
  lastReviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

// ConversationMessage Types
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

// UserNote Types
export type NoteType = "NOTE" | "HIGHLIGHT" | "BOOKMARK";

export type UserNote = {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  content: string;
  type: NoteType;
  pageRef: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// RevisionSchedule Types
export type RevisionSchedule = {
  id: string;
  userId: string;
  bookId: string;
  chapterId: string;
  scheduledAt: Date;
  completedAt: Date | null;
  interval: number;
  createdAt: Date;
  updatedAt: Date;
};

// Dashboard Types
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

// Server Action Response Types
export type ServerActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Session Types
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

// Form Input Types
export type CreateBookInput = Omit<Book, "id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateUserBookInput = Partial<Omit<UserBook, "id" | "userId" | "bookId" | "createdAt" | "updatedAt">>;
export type CreateNoteInput = Omit<UserNote, "id" | "userId" | "createdAt" | "updatedAt">;
export type CreateQuizAttemptInput = Omit<QuizAttempt, "id" | "createdAt" | "updatedAt">;
