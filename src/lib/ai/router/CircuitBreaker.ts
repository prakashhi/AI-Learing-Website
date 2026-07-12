export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
  successThreshold: number;
  onStateChange?: (state: CircuitState) => void;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failures = 0;
  private successes = 0;
  private openedAt = 0;

  constructor(private readonly opts: CircuitBreakerOptions) {}

  getState(): CircuitState {
    return this.state;
  }

  async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.openedAt >= this.opts.cooldownMs) {
        this.state = "HALF_OPEN";
        this.successes = 0;
        this.opts.onStateChange?.(this.state);
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (e) {
      this.onFailure();
      throw e;
    }
  }

  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successes += 1;
      if (this.successes >= this.opts.successThreshold) {
        this.state = "CLOSED";
        this.failures = 0;
        this.opts.onStateChange?.(this.state);
      }
    } else if (this.state === "CLOSED") {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      this.openedAt = Date.now();
    } else if (this.failures >= this.opts.failureThreshold) {
      this.state = "OPEN";
      this.openedAt = Date.now();
    }
    this.opts.onStateChange?.(this.state);
  }
}
