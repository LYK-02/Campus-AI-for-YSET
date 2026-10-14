---
name: bullmq-specialist
description: >-
  Expert guidance for designing, implementing, debugging, and optimizing distributed background job processing systems with BullMQ and Redis in Node.js and TypeScript. Use when implementing queues, workers, parent-child flows, repeatable jobs, concurrency limits, sandboxed processors, or diagnosing stalled/failed jobs.
---

# BullMQ Specialist Runbook

BullMQ is the standard Redis-backed queue system for Node.js and TypeScript, built on Redis Streams, Hashes, and Sorted Sets.

---

## Critical Invariants (Must Follow)

1. **`maxRetriesPerRequest: null` on Redis Connections**:
   - BullMQ blocking commands (`BRPOPLPUSH`, `BZPOPMIN`, streams) require `maxRetriesPerRequest: null` in `ioredis`. Failing to do this causes commands to timeout and crash during network blips or failovers.
2. **Never Share Redis Connection Instances Between Blocking Workers and Queues**:
   - `Worker` instances block connections while waiting for jobs. A `Worker` needs its own dedicated connection or connection factory. Do NOT reuse a single `ioredis` instance across multiple `Worker` instances or between a `Worker` and a `Queue`.
3. **Always Set Retention Policies (`removeOnComplete` & `removeOnFail`)**:
   - Without explicit retention policies, Redis memory will grow unbounded with job metadata, logs, and stack traces.
   - Standard: `removeOnComplete: { count: 1000, age: 3600 * 24 }`, `removeOnFail: { count: 5000 }`.
4. **Offload Large Payloads**:
   - Keep job data payloads small (< 10 KB). Do not store file buffers, raw images, or giant JSON payloads in job data. Store payloads in object storage (S3/GCS/MinIO) or a database and pass IDs or object keys.
5. **Implement Graceful Shutdown**:
   - Always catch `SIGTERM` and `SIGINT` signals and call `await worker.close()` to allow active jobs to finish and release locks before the process exits.

---

## Architecture Overview

```text
Producer (API / Service)
    │
    ▼ add(name, data, opts)
[ Redis Queue (Streams / ZSets / Hashes) ]
    │
    ├─► Worker (I/O Bound) ──► Standard Async Processor (Concurrency N)
    ├─► Worker (CPU Bound) ──► Sandboxed Processor (Worker Threads / Fork)
    └─► QueueEvents / BullBoard ──► Observability & Monitoring
```

---

## Standard Queue & Worker Setup (TypeScript)

### 1. Dedicated Redis Connection Helper
```typescript
import IORedis, { RedisOptions } from 'ioredis';

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // REQUIRED for BullMQ
  enableReadyCheck: false,
};

export const createRedisConnection = () => new IORedis(redisConfig);
```

### 2. Queue Definition with Default Job Options
```typescript
import { Queue } from 'bullmq';
import { createRedisConnection } from './redis';

export interface EmailJobData {
  to: string;
  templateId: string;
  variables: Record<string, any>;
}

export const emailQueue = new Queue<EmailJobData>('email-queue', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s, 16s...
    },
    removeOnComplete: {
      count: 1000, // keep latest 1000 completed
      age: 24 * 3600, // keep for 24 hours max
    },
    removeOnFail: {
      count: 5000, // keep latest 5000 failed for inspection
    },
  },
});
```

### 3. Worker Implementation & Graceful Shutdown
```typescript
import { Worker, Job } from 'bullmq';
import { createRedisConnection } from './redis';
import { EmailJobData } from './emailQueue';

export const emailWorker = new Worker<EmailJobData>(
  'email-queue',
  async (job: Job<EmailJobData>) => {
    job.log(`Starting delivery to ${job.data.to}`);
    await sendEmailService(job.data);
    await job.updateProgress(100);
    return { deliveredAt: new Date().toISOString() };
  },
  {
    connection: createRedisConnection(),
    concurrency: 10, // Adjust according to downstream I/O limits
    limiter: {
      max: 100,      // Rate limiting: 100 jobs
      duration: 1000 // per 1000ms
    }
  }
);

emailWorker.on('completed', (job: Job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`Job ${job?.id} failed with reason: ${err.message}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing worker...`);
  await emailWorker.close();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

---

## Key Decision Matrix

| Scenario | Recommendation | Reference Guide |
| :--- | :--- | :--- |
| **CPU-Intensive Tasks** (Image resizing, PDF generation, heavy parsing) | Use **Sandboxed Worker Process/Thread** to prevent blocking Node's event loop | [Sandboxing & Concurrency](./references/worker-concurrency-sandboxing.md) |
| **Task Dependencies** (Step A -> Step B -> Step C, or Map-Reduce) | Use **`FlowProducer`** with parent-child trees | [Flows & Parent-Child Jobs](./references/flows-and-parent-child-jobs.md) |
| **Job Deduplication / Idempotency** | Set explicit deterministic `jobId: `${action}:${uniqueEntityId}`` | [Patterns & Connection](./references/connection-and-architecture.md) |
| **Jobs Failing as "Missing lock for job" / Stalled** | Extend `lockDuration` or check for event loop blocking | [Troubleshooting & Stalled Jobs](./references/troubleshooting-and-stalled.md) |
| **Scheduled / Cron Jobs** | `repeat: { pattern: '0 0 * * *' }` with explicit timezone | [Flows & Parent-Child Jobs](./references/flows-and-parent-child-jobs.md) |

---

## Implementation Checklist

- [ ] `maxRetriesPerRequest: null` configured on all Redis connection options.
- [ ] Worker and Queue instances have independent Redis connections.
- [ ] `removeOnComplete` and `removeOnFail` explicitly configured.
- [ ] `attempts` and exponential `backoff` configured for transient error resilience.
- [ ] Job processor is purely asynchronous and does not synchronously block the event loop for > 100ms.
- [ ] Heavy CPU logic moved to sandboxed worker file.
- [ ] Graceful shutdown handler attached to `SIGTERM` / `SIGINT`.
- [ ] Progress reporting (`job.updateProgress(percent)`) and logs (`job.log(msg)`) used for long-running jobs.
- [ ] `jobId` specified when deduplication or idempotency is required.

---

## Detailed References

- [Connection Architecture, Redis Sentinel & Clustering](./references/connection-and-architecture.md)
- [Worker Concurrency & Sandboxed Processors](./references/worker-concurrency-sandboxing.md)
- [FlowProducer, Parent-Child Trees & Repeatable Jobs](./references/flows-and-parent-child-jobs.md)
- [Troubleshooting Stalled Jobs, Memory & Dead-Letter Queues](./references/troubleshooting-and-stalled.md)
