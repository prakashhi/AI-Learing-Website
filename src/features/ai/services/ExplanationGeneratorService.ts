import { AIRouter } from "@/lib/ai";
import { BaseService } from "@/services/BaseService";
import {
  SectionExplanationSchema,
  type SectionExplanation,
} from "./schemas";

const SYSTEM_PROMPT = `You are an expert educator. Given a section of text from a textbook, generate a comprehensive learning explanation.

Return JSON exactly:
{
  "explanation": "Clear, detailed explanation of this section",
  "concepts": ["key concept 1", "key concept 2"],
  "definitions": { "term": "definition" },
  "examples": ["example 1", "example 2"],
  "formulas": ["formula 1"],
  "keywords": ["keyword1", "keyword2"],
  "commonMistakes": ["mistake 1", "mistake 2"],
  "memoryTips": ["tip 1", "tip 2"]
}`;

export class ExplanationGeneratorService extends BaseService {
  private static instance: ExplanationGeneratorService;

  static getInstance(): ExplanationGeneratorService {
    if (!ExplanationGeneratorService.instance) {
      ExplanationGeneratorService.instance = new ExplanationGeneratorService();
    }
    return ExplanationGeneratorService.instance;
  }

  async generate(sectionText: string): Promise<SectionExplanation> {
    const res = await AIRouter.getInstance().request({
      systemPrompt: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate explanation for this section:\n\n${sectionText}`,
        },
      ],
      schema: SectionExplanationSchema,
    });

    return res.parsed as SectionExplanation;
  }
}
