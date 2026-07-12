import { AIRouter } from "@/lib/ai";
import { BaseService } from "@/services/BaseService";
import {
  SplitSectionArraySchema,
  type SplitSection,
} from "./schemas";

const SYSTEM_PROMPT = `You are a document section splitter. Given a chapter's text, split it into logical semantic sections.

Each section should represent a complete topic or subtopic (Introduction, Concept Explanation, Example, Summary, etc.).
Do NOT split arbitrarily by word count — keep related content together.

Return JSON array:
[
  { "title": "Section title", "text": "Full section content" }
]`;

export class SectionSplitterService extends BaseService {
  private static instance: SectionSplitterService;

  static getInstance(): SectionSplitterService {
    if (!SectionSplitterService.instance) {
      SectionSplitterService.instance = new SectionSplitterService();
    }
    return SectionSplitterService.instance;
  }

  async split(chapterContent: string): Promise<SplitSection[]> {
    const res = await AIRouter.getInstance().request({
      systemPrompt: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Split this chapter into logical sections:\n\n${chapterContent}`,
        },
      ],
      schema: SplitSectionArraySchema,
    });

    const parsed = res.parsed as SplitSection[];
    return parsed.map((s, i) => ({
      index: i,
      title: s.title || `Section ${i + 1}`,
      text: s.text,
    }));
  }
}
