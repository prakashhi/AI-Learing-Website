import "dotenv/config";
import { startQueue, stopQueue } from "@/queue/pgboss";
import { startBookProcessingWorker } from "./bookProcessingWorker";
import { initializeModels } from "@/lib/db/init";
import { QueueService } from "@/services/QueueService";
import { QUEUES } from "@/queue/queues";
import ProcessingJob from "@/models/ProcessingJob";
import { Op } from "sequelize";

async function requeueStaleJobs() {
  const stale = await ProcessingJob.findAll({
    where: {
      [Op.or]: {
        status: ["QUEUED", "PROCESSING"],
      },
    },
  });
  for (const job of stale) {
    console.log(job)
    const pgBossJobId = await QueueService.getInstance().add(
      QUEUES.BOOK_PROCESSING,
      { bookId: job.dataValues.bookId },
      { retryLimit: 2, retryDelay: 60, expireInSeconds: 30 },
    );
    await job.update({ pgBossJobId : pgBossJobId });
    await job.save();
  }
  if (stale.length > 0) {
    console.log(`[worker] Re-queued ${stale.length} stale jobs`);
  }
}

async function main() {
  initializeModels();
  await startQueue();
  await requeueStaleJobs();
  startBookProcessingWorker();
  console.log("Book processing worker started");

  const heartbeat = setInterval(() => {
    console.log(`[heartbeat] ${new Date().toISOString()}`);
  }, 30_000);

  const shutdown = async (signal: string) => {
    console.log(`[worker] Received ${signal}, shutting down...`);
    clearInterval(heartbeat);
    await stopQueue();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
