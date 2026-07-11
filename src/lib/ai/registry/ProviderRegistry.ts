import type { AIProvider, ProviderId } from "../types";
import { getProviderConfig } from "../config";
import { GeminiProvider } from "../providers/GeminiProvider";
import { GroqProvider } from "../providers/GroqProvider";
import { DeepSeekProvider } from "../providers/DeepSeekProvider";

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers = new Map<ProviderId, AIProvider>();

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  get(id: ProviderId): AIProvider {
    const existing = this.providers.get(id);
    if (existing) return existing;
    const provider = this.create(id);
    this.providers.set(id, provider);
    return provider;
  }

  has(id: ProviderId): boolean {
    return this.providers.has(id);
  }

  private create(id: ProviderId): AIProvider {
    const cfg = getProviderConfig(id);
    const apiKey = process.env[cfg.apiKeyEnv] || "";

    switch (id) {
      case "groq":
        return new GroqProvider({ apiKey, baseURL: cfg.baseURL, model: cfg.model });
      case "deepseek":
        return new DeepSeekProvider({ apiKey, baseURL: cfg.baseURL, model: cfg.model });
      case "gemini":
        return new GeminiProvider(apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${id}`);
    }
  }
}
