import { AIRouter } from "@/lib/ai";
import { BaseService } from "@/services/BaseService";
import {
  VerificationResultSchema,
  type VerificationResult,
} from "./schemas";

const SYSTEM_PROMPT = `You are a content verification AI. Compare the original chapter text against the AI-generated explanation.

Check these 8 categories for missing content:
1. concepts
2. definitions
3. examples
4. theorems or principles
5. formulas or equations
6. diagram descriptions
7. warnings or edge cases
8. conclusions

Return JSON:
{
  "isComplete": true/false,
  "missingItems": ["description of each missing item"],
  "finalExplanation": "The original explanation with any missing content appended. If complete, return the original explanation unchanged."
}`;

export class VerificationService extends BaseService {
  private static instance: VerificationService;

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  async verify(
    originalChapter: string,
    generatedExplanation: string,
  ): Promise<VerificationResult> {
    const res = await AIRouter.getInstance().request({
      systemPrompt: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Original chapter:\n${originalChapter}\n\nGenerated explanation:\n${generatedExplanation}`,
        },
      ],
      schema: VerificationResultSchema,
    });

    return res.parsed as VerificationResult;
  }
}
