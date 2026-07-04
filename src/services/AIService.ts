import { getProvider } from "@/lib/ai";
import type { AIChatRequest } from "@/lib/ai/types";
import { BaseService } from "./BaseService";

export class AIService extends BaseService {
  private provider = getProvider();

  async splitIntoSections(chapterContent: string): Promise<string[]> {
    const prompt: AIChatRequest = {
      systemPrompt:
        "Split the following chapter content into logical sections. " +
        "Each section should cover a complete topic. " +
        "Return the sections as a JSON array of strings. " +
        "Do NOT split mid-topic based on word count.",
      messages: [{ role: "user", content: chapterContent }],
    };

    const response = await this.provider.chat(prompt);
    return JSON.parse(response.content);
  }

  async generateExplanation(
    sectionText: string,
  ): Promise<{
    explanation: string;
    concepts: string[];
    definitions: Record<string, string>;
    examples: string[];
    formulas: string[];
    keywords: string[];
    commonMistakes: string[];
    memoryTips: string[];
  }> {
    const prompt: AIChatRequest = {
      systemPrompt:
        "Generate a comprehensive explanation for the given section text. " +
        "Return JSON with: explanation, concepts (array), definitions (object), " +
        "examples (array), formulas (array), keywords (array), " +
        "commonMistakes (array), memoryTips (array).",
      messages: [{ role: "user", content: sectionText }],
    };

    const response = await this.provider.chat(prompt);
    return JSON.parse(response.content);
  }

  async verifyContent(
    originalChapter: string,
    generatedExplanation: string,
  ): Promise<{
    isComplete: boolean;
    missingItems: string[];
    regeneratedParts: string[];
  }> {
    const prompt: AIChatRequest = {
      systemPrompt:
        "Compare the original chapter against the generated explanation. " +
        "Check for missing: concepts, definitions, examples, theorems, formulas, " +
        "diagram descriptions, warnings, conclusions. " +
        "Return JSON: { isComplete: boolean, missingItems: string[], regeneratedParts: string[] }." +
        "If missing items exist, generate the missing content in regeneratedParts.",
      messages: [
        { role: "user", content: `Original:\n${originalChapter}\n\nGenerated:\n${generatedExplanation}` },
      ],
    };

    const response = await this.provider.chat(prompt);
    return JSON.parse(response.content);
  }

  async generateLearningMaterial(
    chapterExplanation: string,
  ): Promise<{
    beginnerExplanation: string;
    detailedExplanation: string;
    keyConcepts: string[];
    definitions: Record<string, string>;
    examples: string[];
    realWorldApplications: string[];
    chapterSummary: string;
    flashcards: Array<{ front: string; back: string }>;
    revisionNotes: string[];
    memoryTricks: string[];
    mcqs: Array<{ question: string; options: string[]; correctIndex: number }>;
    shortAnswerQuestions: string[];
    longAnswerQuestions: string[];
    codingTasks: string[];
    practicalAssignments: string[];
    interviewQuestions: string[];
    difficultyLevel: "beginner" | "intermediate" | "advanced";
  }> {
    const prompt: AIChatRequest = {
      systemPrompt:
        "Generate comprehensive 17-point learning materials from the chapter explanation. " +
        "Return JSON with all 17 fields: beginnerExplanation, detailedExplanation, " +
        "keyConcepts, definitions, examples, realWorldApplications, chapterSummary, " +
        "flashcards (array of {front, back}), revisionNotes, memoryTricks, " +
        "mcqs (array of {question, options, correctIndex}), shortAnswerQuestions, " +
        "longAnswerQuestions, codingTasks, practicalAssignments, interviewQuestions, " +
        "difficultyLevel ('beginner'|'intermediate'|'advanced').",
      messages: [{ role: "user", content: chapterExplanation }],
    };

    const response = await this.provider.chat(prompt);
    return JSON.parse(response.content);
  }
}
