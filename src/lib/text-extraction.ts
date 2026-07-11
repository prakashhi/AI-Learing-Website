import type { Buffer } from "buffer";

export type ExtractedChapter = {
  index: number;
  title: string;
  content: string;
};

export type ExtractionResult = {
  chapters: ExtractedChapter[];
  title?: string;
};

type RawLine = {
  text: string;
  maxFontSize: number;
  fontName: string;
  isBold: boolean;
  bbox: readonly [number, number, number, number];
  pageIndex: number;
  blockIndex: number;
};

type FontAnalysis = {
  bodySize: number;
  headingThresholds: number[];
  headingLevels: number;
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

function extractPDFPages(doc: any, pageCount: number): {
  sizeCounts: Map<number, number>;
  rawLines: RawLine[];
  pageHeight: number;
} {
  const sizeCounts = new Map<number, number>();
  const allLines: RawLine[] = [];
  let pageHeight = 0;

  for (let i = 0; i < pageCount; i++) {
    const page = doc.loadPage(i);

    if (i === 0) {
      const bounds = page.getBounds();
      pageHeight = bounds[3] - bounds[1];
    }

    const stext = page.toStructuredText();
    let blockIndex = -1;
    let currentText = "";
    let currentMaxSize = 0;
    let currentFontName = "";
    let currentIsBold = false;
    let currentBbox: [number, number, number, number] = [0, 0, 0, 0];

    stext.walk({
      beginTextBlock() {
        blockIndex++;
      },
      beginLine(bbox: [number, number, number, number]) {
        currentText = "";
        currentMaxSize = 0;
        currentFontName = "";
        currentIsBold = false;
        currentBbox = bbox;
      },
      onChar(
        c: string,
        _origin: [number, number],
        font: any,
        size: number,
      ) {
        currentText += c;
        if (size > currentMaxSize) currentMaxSize = size;
        currentFontName = font.getName();
        currentIsBold = font.isBold();

        const rounded = Math.round(size * 10) / 10;
        sizeCounts.set(rounded, (sizeCounts.get(rounded) || 0) + 1);
      },
      endLine() {
        const text = currentText.trim();
        if (text) {
          allLines.push({
            text,
            maxFontSize: currentMaxSize,
            fontName: currentFontName,
            isBold: currentIsBold,
            bbox: currentBbox,
            pageIndex: i,
            blockIndex,
          });
        }
      },
    });
  }

  return { sizeCounts, rawLines: allLines, pageHeight };
}

function minGap(a: number, b: number): number {
  return Math.max(1.5, Math.min(a, b) * 0.15);
}

function analyzeSizes(sizeCounts: Map<number, number>): FontAnalysis {
  const clusters = [...sizeCounts.entries()]
    .map(([size, count]) => ({ size, totalChars: count }))
    .sort((a, b) => a.size - b.size);

  if (clusters.length === 0) {
    return { bodySize: 12, headingThresholds: [], headingLevels: 0 };
  }
  if (clusters.length === 1) {
    return {
      bodySize: clusters[0].size,
      headingThresholds: [],
      headingLevels: 0,
    };
  }

  const groups: { avgSize: number; totalChars: number; minSize: number }[] = [];
  let currentMin = clusters[0].size;
  let currentSum = clusters[0].size * clusters[0].totalChars;
  let currentChars = clusters[0].totalChars;

  for (let i = 1; i < clusters.length; i++) {
    const prev = clusters[i - 1].size;
    const curr = clusters[i].size;
    if (curr - prev > minGap(prev, curr)) {
      groups.push({
        avgSize: Math.round((currentSum / currentChars) * 10) / 10,
        totalChars: currentChars,
        minSize: currentMin,
      });
      currentMin = curr;
      currentSum = 0;
      currentChars = 0;
    }
    currentSum += curr * clusters[i].totalChars;
    currentChars += clusters[i].totalChars;
  }
  groups.push({
    avgSize: Math.round((currentSum / currentChars) * 10) / 10,
    totalChars: currentChars,
    minSize: currentMin,
  });

  groups.sort((a, b) => b.totalChars - a.totalChars);
  const bodyCluster = groups[0];
  const headingClusters = groups
    .filter((c) => c !== bodyCluster)
    .sort((a, b) => a.avgSize - b.avgSize);

  const headingLevels = Math.min(headingClusters.length, 3);
  const topClusters = headingClusters.slice(-headingLevels);
  const thresholds = topClusters.map((c) => c.minSize);

  return {
    bodySize: bodyCluster.avgSize,
    headingThresholds: thresholds,
    headingLevels,
  };
}

function fixHyphenation(lines: RawLine[]): RawLine[] {
  const result: RawLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = { ...lines[i] };
    const hyphenMatch = line.text.match(/^(.+?)-$/);
    if (hyphenMatch && i + 1 < lines.length) {
      const next = lines[i + 1];
      const nextStart = next.text.match(/^(\w+)(.*)$/);
      if (nextStart) {
        line.text = hyphenMatch[1] + nextStart[1];
        const remainder = nextStart[2].trim();
        if (remainder) {
          lines[i + 1] = { ...next, text: remainder };
        } else {
          i++;
        }
      }
    }
    result.push(line);
  }
  return result;
}

function classifyLines(
  lines: RawLine[],
  analysis: FontAnalysis,
): (RawLine & { level: "body" | "h1" | "h2" | "h3" })[] {
  const thresholds = analysis.headingThresholds;
  const count = thresholds.length;

  return lines.map((line) => {
    const size = line.maxFontSize;
    let level: "body" | "h1" | "h2" | "h3" = "body";

    if (count === 3) {
      if (size >= thresholds[2]) level = "h1";
      else if (size >= thresholds[1]) level = "h2";
      else if (size >= thresholds[0]) level = "h3";
    } else if (count === 2) {
      if (size >= thresholds[1]) level = "h1";
      else if (size >= thresholds[0]) level = "h2";
    } else if (count === 1) {
      if (size >= thresholds[0]) level = "h1";
    }

    if (
      level === "body" &&
      line.isBold &&
      size >= analysis.bodySize &&
      count > 0
    ) {
      level = count === 1 ? "h1" : count === 2 ? "h2" : "h3";
    }

    return { ...line, level };
  });
}

function filterHeadersFooters(
  lines: (RawLine & { level: "body" | "h1" | "h2" | "h3" })[],
  pageHeight: number,
) {
  const marginRatio = 0.08;
  const headerZone = pageHeight * marginRatio;
  const footerZone = pageHeight * (1 - marginRatio);

  return lines.filter((line) => {
    const y = line.bbox[1];
    if (y < headerZone || y > footerZone) {
      return line.level !== "body";
    }
    return true;
  });
}

function mergeMultiLineHeadings(
  lines: (RawLine & { level: "body" | "h1" | "h2" | "h3" })[],
) {
  const result: (RawLine & { level: "body" | "h1" | "h2" | "h3" })[] = [];

  for (let i = 0; i < lines.length; i++) {
    const current = { ...lines[i] };
    while (
      i + 1 < lines.length &&
      current.level !== "body" &&
      lines[i + 1].level === current.level
    ) {
      current.text += " " + lines[i + 1].text;
      i++;
    }
    result.push(current);
  }

  return result;
}

function buildChapters(
  lines: (RawLine & { level: "body" | "h1" | "h2" | "h3" })[],
): ExtractionResult {
  const chapters: ExtractedChapter[] = [];
  let currentTitle = "Introduction";
  let currentContent: string[] = [];
  let currentBlockIndex: number | null = null;
  let chapterIndex = 0;

  function flushBlock() {
    if (currentContent.length === 0) return;
    chapters.push({
      index: chapterIndex++,
      title: currentTitle,
      content: currentContent.join("\n\n").trim(),
    });
    currentContent = [];
  }

  for (const line of lines) {
    if (line.level === "h1") {
      flushBlock();
      currentTitle = line.text;
      currentBlockIndex = null;
      continue;
    }

    if (
      currentBlockIndex !== null &&
      line.blockIndex !== currentBlockIndex &&
      currentContent.length > 0
    ) {
      currentContent.push("");
    }
    currentBlockIndex = line.blockIndex;

    currentContent.push(line.text);
  }

  flushBlock();

  return { chapters };
}

async function extractPDF(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const { Document } = await import("mupdf");
    const doc = Document.openDocument(buffer, "pdf");
    const pageCount = doc.countPages();

    if (pageCount === 0) {
      return {
        chapters: [{ index: 0, title: "Introduction", content: "" }],
      };
    }

    const { sizeCounts, rawLines, pageHeight } = extractPDFPages(doc, pageCount);
    const analysis = analyzeSizes(sizeCounts);
    const hyphenFixed = fixHyphenation(rawLines);
    const classified = classifyLines(hyphenFixed, analysis);
    const filtered = filterHeadersFooters(classified, pageHeight);
    const merged = mergeMultiLineHeadings(filtered);

    return buildChapters(merged);
  } catch (e) {
    console.error("MuPDF.js extraction failed:", e);
    throw new Error(
      "PDF parsing failed. Ensure 'mupdf' package is installed.",
    );
  }
}

async function extractEPUB(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const epubParser = await import("epub-parser");
    const data = await epubParser.parse(buffer);
    const text = (data?.spine || []).map((item: any) => item.text).join("\n\n");
    return detectChapters(text);
  } catch {
    throw new Error(
      "EPUB parsing failed. Ensure 'epub-parser' package is installed.",
    );
  }
}

async function extractDOCX(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return detectChapters(result.value);
  } catch {
    throw new Error(
      "DOCX parsing failed. Ensure 'mammoth' package is installed.",
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
