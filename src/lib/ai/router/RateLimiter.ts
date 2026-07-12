export class RateLimiter {
  private capacity: number;
  private refillPerSec: number;
  private tokens: number;
  private lastRefill: number;
  private waiters: Array<() => void> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(opts: { capacity: number; refillPerSec: number }) {
    this.capacity = opts.capacity;
    this.refillPerSec = opts.refillPerSec;
    this.tokens = opts.capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    if (elapsedSec > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillPerSec);
      this.lastRefill = now;
    }
  }

  get available(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
      this.scheduleDrip();
    });
  }

  private scheduleDrip(): void {
    if (this.timer) return;
    const delayMs = Math.max(10, 1000 / this.refillPerSec);
    this.timer = setTimeout(() => this.drip(), delayMs);
  }

  private drip(): void {
    this.timer = null;
    this.refill();
    while (this.waiters.length > 0 && this.tokens >= 1) {
      this.tokens -= 1;
      const resolve = this.waiters.shift()!;
      resolve();
    }
    if (this.waiters.length > 0) this.scheduleDrip();
  }
}
