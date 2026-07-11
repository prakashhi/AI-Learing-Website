import type { ProviderId } from "./config";

export type { ProviderId };

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIChatRequest {
  messages: AIChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
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
  readonly id: ProviderId;
  chat(req: AIChatRequest): Promise<AIChatResponse>;
  chatStream?(req: AIChatRequest): AsyncIterable<string>;
}
