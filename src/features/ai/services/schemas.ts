import { z } from "zod";

export const SplitSectionArraySchema = z.array(
  z.object({
    title: z.string(),
    text: z.string(),
  }),
);

export type SplitSection = {
  index: number;
  title: string;
  text: string;
};

export const SectionExplanationSchema = z.object({
  explanation: z.string(),
  concepts: z.array(z.string()),
  definitions: z.record(z.string()),
  examples: z.array(z.string()),
  formulas: z.array(z.string()),
  keywords: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  memoryTips: z.array(z.string()),
});

export type SectionExplanation = z.infer<typeof SectionExplanationSchema>;

export const VerificationResultSchema = z.object({
  isComplete: z.boolean(),
  missingItems: z.array(z.string()),
  finalExplanation: z.string(),
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;

export const LearningContentSchema = z.object({
  beginnerExplanation: z.string(),
  detailedExplanation: z.string(),
  keyConcepts: z.array(z.string()),
  definitions: z.record(z.string()),
  examples: z.array(z.string()),
  realWorldApplications: z.array(z.string()),
  chapterSummary: z.string(),
  flashcards: z.array(z.object({ front: z.string(), back: z.string() })),
  revisionNotes: z.array(z.string()),
  memoryTricks: z.array(z.string()),
  mcqs: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number().int(),
      explanation: z.string(),
    }),
  ),
  shortAnswerQuestions: z.array(z.string()),
  longAnswerQuestions: z.array(z.string()),
  codingTasks: z.array(z.string()),
  practicalAssignments: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
  difficultyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
});

export type LearningContent = z.infer<typeof LearningContentSchema>;
