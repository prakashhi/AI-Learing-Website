export function cleanText(rawText: string): string {
  let text = rawText;

  text = text.replace(/\f/g, " ");
  text = text.replace(/^\s*\d+\s*$/gm, "");
  text = text.replace(/(?:^|\n)[\s\-_]+\n/g, "\n");

  text = text.replace(/(?<=\w)-\s*\n(?=\w)/g, "");
  text = text.replace(/(?<=\w)\s*\n(?=\w)/g, " ");

  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");

  text = text.trim();

  return text;
}
