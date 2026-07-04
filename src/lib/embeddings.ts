import { getProvider } from "@/lib/ai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getProvider();
  return provider.generateEmbedding(text);
}

export async function generateBatchEmbeddings(
  chunks: { index: number; content: string }[]
): Promise<{ index: number; embedding: number[] }[]> {
  const results: { index: number; embedding: number[] }[] = [];

  for (const chunk of chunks) {
    const truncated = chunk.content.slice(0, 8000);
    const embedding = await generateEmbedding(truncated);
    results.push({ index: chunk.index, embedding });
  }

  return results;
}
