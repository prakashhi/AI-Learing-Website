import { getProvider } from "@/lib/ai";

export interface SectionExplanation {
  explanation: string;
  concepts: string[];
  definitions: Record<string, string>;
  examples: string[];
  formulas: string[];
  keywords: string[];
  commonMistakes: string[];
  memoryTips: string[];
}

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

export async function generateExplanation(sectionText: string): Promise<SectionExplanation> {
  const provider = getProvider();
  const response = await provider.chat({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Generate explanation for this section:\n\n${sectionText}` },
    ],
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      explanation: parsed.explanation || response.content,
      concepts: parsed.concepts || [],
      definitions: parsed.definitions || {},
      examples: parsed.examples || [],
      formulas: parsed.formulas || [],
      keywords: parsed.keywords || [],
      commonMistakes: parsed.commonMistakes || [],
      memoryTips: parsed.memoryTips || [],
    };
  } catch {
    return {
      explanation: response.content,
      concepts: [],
      definitions: {},
      examples: [],
      formulas: [],
      keywords: [],
      commonMistakes: [],
      memoryTips: [],
    };
  }
}
