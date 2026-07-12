import { createHash } from "crypto";
import { Op } from "sequelize";
import AICache from "@/models/AICache";

export class AICacheService {
  private static instance: AICacheService;

  static getInstance(): AICacheService {
    if (!AICacheService.instance) {
      AICacheService.instance = new AICacheService();
    }
    return AICacheService.instance;
  }

  buildKey(provider: string, modelVersion: string, prompt: string): string {
    return createHash("sha256")
      .update(`${provider}:${modelVersion}:${prompt}`)
      .digest("hex");
  }

  async get(key: string): Promise<string | null> {
    const row = await AICache.findByPk(key);
    if (!row) return null;

    if (row.expiresAt.getTime() <= Date.now()) {
      await AICache.destroy({ where: { key } });
      return null;
    }

    await AICache.increment("hitCount", { by: 1, where: { key } });
    return row.value;
  }

  async set(
    key: string,
    value: string,
    ttlSec: number,
    meta: { provider: string; model: string },
  ): Promise<void> {
    await AICache.upsert({
      key,
      value,
      provider: meta.provider,
      model: meta.model,
      expiresAt: new Date(Date.now() + ttlSec * 1000),
    });
  }

  async sweepExpired(): Promise<number> {
    return AICache.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } },
    });
  }
}
