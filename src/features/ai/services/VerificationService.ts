import { getProvider } from "@/lib/ai";

export interface VerificationResult {
  isComplete: boolean;
  missingItems: string[];
  finalExplanation: string;
}

const SYSTEM_PROMPT = `You are a content verification AI. Compare the original chapter text against the AI-generated explanation.

Check these 8 categories for missing content:
1. concepts — key concepts present in original but missing from explanation
2. definitions — important terms defined in original but missing
3. examples — examples given in original but missing
4. theorems — theorems or principles stated in original but missing
5. formulas — formulas or equations in original but missing
6. diagram descriptions — visual content described in original but missing
7. warnings — cautions or edge cases mentioned in original but missing
8. conclusions — summary or concluding points in original but missing

Return JSON:
{
  "isComplete": true/false,
  "missingItems": ["description of each missing item"],
  "finalExplanation": "The original explanation with any missing content appended. If complete, return the original explanation unchanged."
}`;

export async function verifyContent(
  originalChapter: string,
  generatedExplanation: string,
): Promise<VerificationResult> {
  const provider = getProvider();
  const response = await provider.chat({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Original chapter:\n${originalChapter}\n\nGenerated explanation:\n${generatedExplanation}`,
      },
    ],
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      isComplete: parsed.isComplete ?? true,
      missingItems: parsed.missingItems || [],
      finalExplanation: parsed.finalExplanation || generatedExplanation,
    };
  } catch {
    return {
      isComplete: true,
      missingItems: [],
      finalExplanation: generatedExplanation,
    };
  }
}
