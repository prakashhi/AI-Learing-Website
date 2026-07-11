import type { BaseAIProvider } from "./providers/BaseProvider";
import { ProviderRegistry } from "./registry/ProviderRegistry";
import type { ProviderId } from "./types";

const ENV_TO_PROVIDER: Record<string, ProviderId> = {
  groq: "groq",
  deepseek: "deepseek",
  gemini: "gemini",
};

export function getProvider(model?: string): BaseAIProvider {
  const key = (model || process.env.AI_PROVIDER || "groq").toLowerCase();
  const id = ENV_TO_PROVIDER[key] || "groq";
  return ProviderRegistry.getInstance().get(id) as BaseAIProvider;
}
