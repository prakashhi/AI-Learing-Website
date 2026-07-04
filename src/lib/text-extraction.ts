

export type ExtractedChapter = {
  index: number;
  title: string;
  content: string;
};

export type ExtractionResult = {
  chapters: ExtractedChapter[];
  title?: string;
};

export async function extractText(
  buffer: Buffer,
  fileType: string,
): Promise<ExtractionResult> {
  switch (fileType) {
    case "pdf":
      return extractPDF(buffer);
    case "epub":
      return extractEPUB(buffer);
    case "docx":
      return extractDOCX(buffer);
    case "md":
    case "markdown":
      return extractMarkdown(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractPDF(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const data = new PDFParse({ data: buffer });
    const text =  await data.getText();
    return detectChapters(text.text);
  } catch (e) {
    console.log(e);
    throw new Error(
      "PDF parsing requires 'pdf-parse' package. Run: npm install pdf-parse",
    );
  }
}

async function extractEPUB(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const epubParser =require("epub-parser")
    const data = await epubParser.parse(buffer);
    const text = (data?.spine || []).map((item: any) => item.text).join("\n\n");
    return detectChapters(text);
  } catch {
    throw new Error(
      "EPUB parsing requires 'epub-parser' package. Run: npm install epub-parser",
    );
  }
}

async function extractDOCX(buffer: Buffer): Promise<ExtractionResult> {
  try {
     const mammoth = require("mammoth");
    // const data = await mammoth.extractRawText({ buffer });
    return detectChapters(data.value);
  } catch {
    throw new Error(
      "DOCX parsing requires 'mammoth' package. Run: npm install mammoth",
    );
  }
}

async function extractMarkdown(buffer: Buffer): Promise<ExtractionResult> {
  const text = buffer.toString("utf-8");
  return detectChapters(text);
}

export function detectChapters(text: string): ExtractionResult {
  const lines = text.split("\n");
  const chapters: ExtractedChapter[] = [];
  let currentTitle = "Introduction";
  let currentContent: string[] = [];
  let chapterIndex = 0;

  const headingRegex = /^#{1,3}\s+(.+)$/;

  for (const line of lines) {
    const match = line.match(headingRegex);
    if (match) {
      if (currentContent.length > 0) {
        chapters.push({
          index: chapterIndex++,
          title: currentTitle,
          content: currentContent.join("\n").trim(),
        });
        currentContent = [];
      }
      currentTitle = match[1].trim();
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0 || chapters.length === 0) {
    chapters.push({
      index: chapterIndex,
      title: currentTitle,
      content: currentContent.join("\n").trim(),
    });
  }

  return { chapters };
}
