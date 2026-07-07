import { getProvider } from "@/lib/ai";

export interface SplitSection {
  index: number;
  title: string;
  text: string;
}

const SYSTEM_PROMPT = `You are a document section splitter. Given a chapter's text, split it into logical semantic sections.

Each section should represent a complete topic or subtopic (Introduction, Concept Explanation, Example, Summary, etc.).
Do NOT split arbitrarily by word count — keep related content together.

Return JSON array:
[
  { "title": "Section title", "text": "Full section content" }
]`;

export async function splitChapter(content: string): Promise<SplitSection[]> {
  const provider = getProvider();
  const response = await provider.chat({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Split this chapter into logical sections:\n\n${content}` },
    ],
  });

  const sections: SplitSection[] = [];
  try {
    const parsed = JSON.parse(response.content);
    if (Array.isArray(parsed)) {
      parsed.forEach((s: any, i: number) => {
        sections.push({ index: i, title: s.title || `Section ${i + 1}`, text: s.text || "" });
      });
    }
  } catch {
    const parts = response.content.split(/\n#{1,3}\s+/);
    parts.forEach((part, i) => {
      if (part.trim()) {
        sections.push({ index: i, title: `Section ${i + 1}`, text: part.trim() });
      }
    });
  }

  return sections.length > 0 ? sections : [{ index: 0, title: "Full Chapter", text: content }];
}
