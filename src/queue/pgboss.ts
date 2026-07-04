import { PgBoss } from "pg-boss";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || "password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "postgres"}`;

let boss: PgBoss | null = null;

export function getQueue(): PgBoss {
  if (!boss) {
    boss = new PgBoss({ connectionString: DATABASE_URL });
  }
  return boss;
}

export async function startQueue(): Promise<void> {
  await getQueue().start();
}

export async function stopQueue(): Promise<void> {
  if (boss) {
    await boss.stop({ graceful: true, timeout: 30_000 });
    boss = null;
  }
}
