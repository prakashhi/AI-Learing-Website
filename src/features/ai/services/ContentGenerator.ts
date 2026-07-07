import { getProvider } from "@/lib/ai";

export interface LearningContent {
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
  mcqs: { question: string; options: string[]; correctAnswer: number; explanation: string }[];
  shortAnswerQuestions: string[];
  longAnswerQuestions: string[];
  codingTasks: string[];
  practicalAssignments: string[];
  interviewQuestions: string[];
  difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

const SYSTEM_PROMPT = `You are an expert curriculum designer. Given a verified chapter explanation, generate comprehensive 17-point learning material.

Return JSON exactly with these fields:
{
  "beginnerExplanation": "Simple explanation for beginners",
  "detailedExplanation": "In-depth technical explanation",
  "keyConcepts": ["concept1", "concept2"],
  "definitions": { "term": "definition" },
  "examples": ["example1", "example2"],
  "realWorldApplications": ["application1"],
  "chapterSummary": "Concise chapter summary",
  "flashcards": [{"front": "question", "back": "answer"}],
  "revisionNotes": ["note1", "note2"],
  "memoryTricks": ["trick1", "trick2"],
  "mcqs": [{"question": "text", "options": ["a","b","c","d"], "correctAnswer": 0, "explanation": "why"}],
  "shortAnswerQuestions": ["question1", "question2"],
  "longAnswerQuestions": ["question1"],
  "codingTasks": ["task1", "task2"],
  "practicalAssignments": ["assignment1"],
  "interviewQuestions": ["q1", "q2"],
  "difficultyLevel": "BEGINNER|INTERMEDIATE|ADVANCED"
}`;

export async function generateLearningContent(
  finalExplanation: string,
): Promise<LearningContent> {
  const provider = getProvider();
  const response = await provider.chat({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Generate learning content from this chapter explanation:\n\n${finalExplanation}` },
    ],
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      beginnerExplanation: parsed.beginnerExplanation || "",
      detailedExplanation: parsed.detailedExplanation || parsed.beginnerExplanation || "",
      keyConcepts: parsed.keyConcepts || [],
      definitions: parsed.definitions || {},
      examples: parsed.examples || [],
      realWorldApplications: parsed.realWorldApplications || [],
      chapterSummary: parsed.chapterSummary || "",
      flashcards: parsed.flashcards || [],
      revisionNotes: parsed.revisionNotes || [],
      memoryTricks: parsed.memoryTricks || [],
      mcqs: parsed.mcqs || [],
      shortAnswerQuestions: parsed.shortAnswerQuestions || [],
      longAnswerQuestions: parsed.longAnswerQuestions || [],
      codingTasks: parsed.codingTasks || [],
      practicalAssignments: parsed.practicalAssignments || [],
      interviewQuestions: parsed.interviewQuestions || [],
      difficultyLevel: parsed.difficultyLevel || "INTERMEDIATE",
    };
  } catch {
    return {
      beginnerExplanation: response.content,
      detailedExplanation: response.content,
      keyConcepts: [],
      definitions: {},
      examples: [],
      realWorldApplications: [],
      chapterSummary: "",
      flashcards: [],
      revisionNotes: [],
      memoryTricks: [],
      mcqs: [],
      shortAnswerQuestions: [],
      longAnswerQuestions: [],
      codingTasks: [],
      practicalAssignments: [],
      interviewQuestions: [],
      difficultyLevel: "INTERMEDIATE",
    };
  }
}
