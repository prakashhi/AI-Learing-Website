import { ZodType } from "zod";
import type {
  AIChatMessage,
  AIChatRequest,
  AIChatResponse,
  ProviderId,
} from "../types";
import { ProviderRegistry } from "../registry/ProviderRegistry";
import { getProviderConfig, ROUTER_CONFIG } from "../config";
import { RateLimiter } from "./RateLimiter";
import { CircuitBreaker } from "./CircuitBreaker";
import { RetryPolicy } from "./RetryPolicy";
import { AICacheService } from "@/features/ai/services/AICacheService";

export interface AIRouterRequest {
  messages: AIChatMessage[];
  systemPrompt?: string;
  schema?: ZodType;
  preferLargeContext?: boolean;
  task?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIRouterResult {
  content: string;
  parsed: unknown;
  provider: ProviderId;
  fromCache: boolean;
  usage?: AIChatResponse["usage"];
}

interface ProviderGuard {
  limiter: RateLimiter;
  breaker: CircuitBreaker;
}

export class AIRouter {
  private static instance: AIRouter;
  private registry = ProviderRegistry.getInstance();
  private cache = AICacheService.getInstance();
  private guards = new Map<ProviderId, ProviderGuard>();

  private constructor() {
    for (const id of ROUTER_CONFIG.defaultChain) {
      this.ensureGuard(id);
    }
  }

  static getInstance(): AIRouter {
    if (!AIRouter.instance) {
      AIRouter.instance = new AIRouter();
    }
    return AIRouter.instance;
  }

  async request(req: AIRouterRequest): Promise<AIRouterResult> {
    const promptKey = JSON.stringify({
      system: req.systemPrompt ?? "",
      messages: req.messages,
    });
    const chain = req.preferLargeContext
      ? ROUTER_CONFIG.largeContextChain
      : ROUTER_CONFIG.defaultChain;

    for (const id of chain) {
      const cfg = getProviderConfig(id);
      const key = this.cache.buildKey(id, cfg.modelVersion, promptKey);
      const cached = await this.cache.get(key);
      if (cached != null) {
        try {
          return await this.resolve(cached, id, true, req);
        } catch {
          // Cached payload no longer validates (e.g. schema changed) — regenerate.
        }
      }
    }

    let lastError: unknown;
    for (const id of chain) {
      const cfg = getProviderConfig(id);
      const guard = this.ensureGuard(id);

      try {
        const response = await guard.limiter
          .acquire()
          .then(() =>
            guard.breaker.exec(() =>
              RetryPolicy.run(
                () =>
                  this.registry.get(id).chat(this.toChatRequest(req)),
                ROUTER_CONFIG.retry,
              ),
            ),
          );

        const result = await this.resolve(response.content, id, false, req);

        const key = this.cache.buildKey(id, cfg.modelVersion, promptKey);
        await this.cache.set(key, response.content, ROUTER_CONFIG.cacheTtlSec, {
          provider: id,
          model: cfg.model,
        });

        return { ...result, usage: response.usage };
      } catch (e) {
        lastError = e;
        console.warn(`[router] provider ${id} failed:`, (e as Error).message);
      }
    }

    throw new Error(
      `All AI providers failed. Last error: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`,
    );
  }

  private ensureGuard(id: ProviderId): ProviderGuard {
    let guard = this.guards.get(id);
    if (!guard) {
      const cfg = getProviderConfig(id);
      guard = {
        limiter: new RateLimiter({
          capacity: cfg.burst,
          refillPerSec: cfg.rps,
        }),
        breaker: new CircuitBreaker({
          failureThreshold: ROUTER_CONFIG.circuit.failureThreshold,
          cooldownMs: ROUTER_CONFIG.circuit.cooldownMs,
          successThreshold: ROUTER_CONFIG.circuit.successThreshold,
          onStateChange: (state) =>
            console.warn(`[circuit] ${id} -> ${state}`),
        }),
      };
      this.guards.set(id, guard);
    }
    return guard;
  }

  private toChatRequest(req: AIRouterRequest): AIChatRequest {
    return {
      messages: req.messages,
      systemPrompt: req.systemPrompt,
      temperature: req.temperature ?? ROUTER_CONFIG.temperature,
      maxTokens: req.maxTokens ?? ROUTER_CONFIG.maxOutputTokens,
    };
  }

  private coerceJson(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      // ignore
    }
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      try {
        return JSON.parse(fenced[1]);
      } catch {
        // ignore
      }
    }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        // ignore
      }
    }
    throw new Error("AI response is not valid JSON");
  }

  private async resolve(
    content: string,
    provider: ProviderId,
    fromCache: boolean,
    req: AIRouterRequest,
  ): Promise<AIRouterResult> {
    let parsed: unknown = null;
    if (req.schema) {
      const json = this.coerceJson(content);
      const result = req.schema.safeParse(json);
      if (!result.success) {
        throw new Error(`Schema validation failed for ${provider}`);
      }
      parsed = result.data;
    }
    return { content, parsed, provider, fromCache };
  }
}
