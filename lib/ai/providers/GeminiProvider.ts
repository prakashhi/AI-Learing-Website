import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { BaseAIProvider } from "./BaseProvider";
import type { AIChatRequest, AIChatResponse } from "../types";

export class GeminiProvider extends BaseAIProvider {
  readonly name = "gemini";
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super({ apiKey });
    this.client = new GoogleGenerativeAI(apiKey);
  }

  protected getDefaultModel(): string {
    return "gemini-2.5-flash";
  }

  private getModel() {
    return this.client.getGenerativeModel({
      model: this.config.model!,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      },
    });
  }

  async chat(req: AIChatRequest): Promise<AIChatResponse> {
    const model = this.getModel();
    const contents = this.buildContents(req);

    const result = await model.generateContent({ contents });
    const response = result.response;
    const text = response.text();

    return {
      content: text,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }

  async *chatStream(req: AIChatRequest): AsyncIterable<string> {
    const model = this.getModel();
    const contents = this.buildContents(req);

    const result = await model.generateContentStream({ contents });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.client.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  private buildContents(req: AIChatRequest) {
    const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

    if (req.systemPrompt) {
      contents.push({
        role: "user",
        parts: [{ text: `[System Instruction]: ${req.systemPrompt}\n\nUnderstood. I will follow these instructions.` }],
      });
      contents.push({
        role: "model",
        parts: [{ text: "I understand and will follow these instructions." }],
      });
    }

    for (const msg of req.messages) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    return contents;
  }
}
