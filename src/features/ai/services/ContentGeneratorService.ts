import { AIRouter } from "@/lib/ai";
import { BaseService } from "@/services/BaseService";
import {
  LearningContentSchema,
  type LearningContent,
} from "./schemas";

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

export class ContentGeneratorService extends BaseService {
  private static instance: ContentGeneratorService;

  static getInstance(): ContentGeneratorService {
    if (!ContentGeneratorService.instance) {
      ContentGeneratorService.instance = new ContentGeneratorService();
    }
    return ContentGeneratorService.instance;
  }

  async generate(finalExplanation: string): Promise<LearningContent> {
    const res = await AIRouter.getInstance().request({
      systemPrompt: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate learning content from this chapter explanation:\n\n${finalExplanation}`,
        },
      ],
      schema: LearningContentSchema,
    });

    return res.parsed as LearningContent;
  }
}
