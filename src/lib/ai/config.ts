export type ProviderId = "groq" | "deepseek" | "gemini";

export interface ProviderConfig {
  id: ProviderId;
  label: string;
  model: string;
  modelVersion: string;
  apiKeyEnv: string;
  baseURL: string;
  rps: number;
  burst: number;
  enabled: boolean;
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  groq: {
    id: "groq",
    label: "Groq Llama 3.3 70B",
    model: "llama-3.3-70b-versatile",
    modelVersion: "1",
    apiKeyEnv: "GROQ_API_KEY",
    baseURL: "https://api.groq.com/openai/v1",
    rps: 10,
    burst: 10,
    enabled: true,
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek V3",
    model: "deepseek-chat",
    modelVersion: "1",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    baseURL: "https://api.deepseek.com",
    rps: 8,
    burst: 8,
    enabled: true,
  },
  gemini: {
    id: "gemini",
    label: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash",
    modelVersion: "1",
    apiKeyEnv: "GEMINI_API_KEY",
    baseURL: "",
    rps: 4,
    burst: 4,
    enabled: true,
  },
};

export const ROUTER_CONFIG = {
  maxOutputTokens: 8192,
  temperature: 0.25,
  retry: {
    maxRetries: 3,
    baseMs: 500,
    maxMs: 8000,
  },
  circuit: {
    failureThreshold: 5,
    cooldownMs: 30_000,
    successThreshold: 2,
  },
  cacheTtlSec: 60 * 60 * 24 * 7,
  largeContextTokenThreshold: 128_000,
  defaultChain: ["groq", "deepseek", "gemini"] as ProviderId[],
  largeContextChain: ["gemini"] as ProviderId[],
};

export function getProviderConfig(id: ProviderId): ProviderConfig {
  const cfg = PROVIDERS[id];
  if (!cfg) throw new Error(`Unknown AI provider: ${id}`);
  return cfg;
}
