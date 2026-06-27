export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIChatRequest {
  messages: AIChatMessage[];
  systemPrompt?: string;
  stream?: boolean;
}

export interface AIChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AIProvider {
  chat(req: AIChatRequest): Promise<AIChatResponse>;
  chatStream(req: AIChatRequest): AsyncIterable<string>;
  generateEmbedding(text: string): Promise<number[]>;
  readonly name: string;
}

export type ProviderName = "gemini" | "openai" | "claude";
