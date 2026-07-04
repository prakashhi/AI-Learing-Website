export type Section = {
  id: string;
  chapterId: string;
  index: number;
  sectionText: string;
  explanation: string | null;
  concepts: any;
  examples: any;
  definitions: any;
  embedding: number[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SectionExplanation = {
  explanation: string;
  concepts: string[];
  definitions: Record<string, string>;
  examples: string[];
  formulas: string[];
  keywords: string[];
  commonMistakes: string[];
  memoryTips: string[];
};

export type VerificationResult = {
  isComplete: boolean;
  missingItems: string[];
  regeneratedContent: string | null;
};

export type LearningContent = {
  beginnerExplanation: string;
  detailedExplanation: string;
  keyConcepts: string[];
  definitions: Record<string, string>;
  examples: string[];
  realWorldApplications: string[];
  chapterSummary: string;
  flashcards: { front: string; back: string }[];
  revisionNotes: string[];
  memoryTricks: string[];
  mcqs: any[];
  shortAnswerQuestions: string[];
  longAnswerQuestions: string[];
  codingTasks: string[];
  practicalAssignments: string[];
  interviewQuestions: string[];
  difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
};
