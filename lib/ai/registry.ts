import type { BaseAIProvider } from "./providers/BaseProvider";
import { GeminiProvider } from "./providers/GeminiProvider";
import type { ProviderName } from "./types";

const providerConstructors: Partial<Record<ProviderName, (apiKey: string) => BaseAIProvider>> = {
  gemini: (key: string) => new GeminiProvider(key),
};

const providerEnvMap: Record<string, ProviderName> = {
  gemini: "gemini",
  openai: "openai",
  claude: "claude",
};

export function getProvider(model?: string): BaseAIProvider {
  const providerName: ProviderName = providerEnvMap[model || process.env.AI_PROVIDER || "gemini"] || "gemini";

  const constructor = providerConstructors[providerName];
  if (!constructor) {
    return new GeminiProvider(process.env.GEMINI_API_KEY || "");
  }

  const apiKey = getApiKey(providerName);
  return constructor(apiKey);
}

function getApiKey(provider: ProviderName): string {
  switch (provider) {
    case "gemini":
      return process.env.GEMINI_API_KEY || "";
    case "openai":
      return process.env.OPENAI_API_KEY || "";
    case "claude":
      return process.env.ANTHROPIC_API_KEY || "";
    default:
      return process.env.GEMINI_API_KEY || "";
  }
}
