import { getQueue, startQueue, stopQueue } from "@/queue/pgboss";
import type { JobWithMetadata } from "pg-boss";

export class QueueService {
  private static instance: QueueService;
  private started = false;

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  async connect(): Promise<void> {
    if (!this.started) {
      await startQueue();
      this.started = true;
    }
  }

  async disconnect(): Promise<void> {
    await stopQueue();
    this.started = false;
  }

  async add<T = Record<string, unknown>>(
    queue: string,
    data: T,
    options?: { retryLimit?: number; retryDelay?: number ,expireInSeconds?:number},
  ): Promise<string> {
    if (!this.started) {
      await startQueue();
      this.started = true;
    }
    const boss = getQueue();
    await boss.createQueue(queue);
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
