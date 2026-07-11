import type {
  AIProvider,
  AIProviderConfig,
  AIChatMessage,
  AIChatRequest,
  AIChatResponse,
  ProviderId,
} from "../types";

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;

  abstract readonly id: ProviderId;

  constructor(config: AIProviderConfig) {
    this.config = {
      temperature: 0.25,
      maxTokens: 8192,
      ...config,
    };
  }

  abstract chat(req: AIChatRequest): Promise<AIChatResponse>;

  protected buildMessages(req: AIChatRequest): Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> {
    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [];

    if (req.systemPrompt) {
      messages.push({ role: "system", content: req.systemPrompt });
    }

    for (const m of req.messages) {
      messages.push({ role: m.role, content: m.content });
    }

    return messages;
  }
}
