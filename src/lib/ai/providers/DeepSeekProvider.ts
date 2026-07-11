import axios from "axios";
import { BaseAIProvider } from "./BaseProvider";
import type { AIChatRequest, AIChatResponse, ProviderId } from "../types";

export class DeepSeekProvider extends BaseAIProvider {
  readonly id: ProviderId = "deepseek";
  private client: ReturnType<typeof axios.create>;

  constructor(config: { apiKey: string; baseURL: string; model: string }) {
    super({ ...config, temperature: 0.25, maxTokens: 8192 });
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: 60_000,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async chat(req: AIChatRequest): Promise<AIChatResponse> {
    const res = await this.client.post("/chat/completions", {
      model: this.config.model,
      messages: this.buildMessages(req),
      temperature: req.temperature ?? this.config.temperature,
      max_tokens: req.maxTokens ?? this.config.maxTokens,
      response_format: { type: "json_object" },
    });

    const choice = res.data?.choices?.[0];
    const usage = res.data?.usage;

    return {
      content: choice?.message?.content ?? "",
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens ?? 0,
            completionTokens: usage.completion_tokens ?? 0,
          }
        : undefined,
    };
  }
}
