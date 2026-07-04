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
