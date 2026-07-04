import { getQueue, startQueue, stopQueue } from "@/queue/pgboss";
import type { JobWithMetadata } from "pg-boss";

export class QueueService {
  async connect(): Promise<void> {
    await startQueue();
  }

  async disconnect(): Promise<void> {
    await stopQueue();
  }

  async add<T = Record<string, unknown>>(
    queue: string,
    data: T,
    options?: { retryLimit?: number; retryDelay?: number },
  ): Promise<string> {
    const boss = getQueue();
    const id = await boss.send(queue, data as object, (options ?? null) as any);
    if (!id) throw new Error(`Failed to enqueue job on "${queue}"`);
    return id;
  }

  async process<Req = any, Res = any>(
    queue: string,
    handler: (jobs: import("pg-boss").Job<Req>[]) => Promise<Res>,
  ): Promise<string> {
    return getQueue().work<Req, Res>(queue, handler);
  }

  async getJob<T = Record<string, unknown>>(
    queue: string,
    jobId: string,
  ): Promise<JobWithMetadata<T> | null> {
    return getQueue().getJobById<T>(queue, jobId);
  }
}
