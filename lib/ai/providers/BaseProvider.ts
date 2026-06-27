import type { AIProvider, AIProviderConfig, AIChatRequest, AIChatResponse } from "../types";

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 4096,
      model: this.getDefaultModel(),
      ...config,
    };
  }

  abstract readonly name: string;
  protected abstract getDefaultModel(): string;

  abstract chat(req: AIChatRequest): Promise<AIChatResponse>;
  abstract chatStream(req: AIChatRequest): AsyncIterable<string>;
  abstract generateEmbedding(text: string): Promise<number[]>;
}
