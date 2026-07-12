export interface RetryOptions {
  maxRetries?: number;
  baseMs?: number;
  maxMs?: number;
}

export class RetryPolicy {
  static async run<T>(
    fn: () => Promise<T>,
    opts?: RetryOptions,
  ): Promise<T> {
    const maxRetries = opts?.maxRetries ?? 3;
    const baseMs = opts?.baseMs ?? 500;
    const maxMs = opts?.maxMs ?? 8000;

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (e) {
        lastError = e;
        if (attempt < maxRetries) {
          const delay = Math.min(baseMs * Math.pow(2, attempt), maxMs);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}
