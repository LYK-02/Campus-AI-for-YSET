# Troubleshooting, Stalled Jobs & Monitoring Guide

## 1. Demystifying "Stalled" Jobs

### How BullMQ Locks Work
When a worker picks up a job, it acquires a Redis lock for that job with a duration defined by `lockDuration` (default: 30,000ms / 30 seconds). While the worker is actively processing, an internal timer periodically renews the lock every `lockRenewTime` (default: half the `lockDuration`, 15 seconds).

A separate interval (`stalledInterval`, default: 30 seconds) checks for jobs whose locks have expired without completion. If an expired lock is detected:
1. BullMQ assumes the worker process died or became unresponsive.
2. It increments `job.attemptsMade`.
3. If `attemptsMade < maxStalledCount` (default: 1), it moves the job back to the `waiting` state to be retried by another worker.
4. If `maxStalledCount` is exceeded, the job is moved to `failed` with the error `job stalled more than maxStalledCount times`.

---

### Root Causes & Fixes for Stalled Jobs

| Root Cause | Diagnostic Indicator | Solution |
| :--- | :--- | :--- |
| **Node.js Event Loop Freeze** | CPU usage spikes to 100%; logs stop during processing. | Move CPU-heavy logic into a **Sandboxed Worker** (`useWorkerThreads: true`). |
| **Out-Of-Memory (OOM) Crash** | Process exits with `SIGKILL` / code 137. Docker/K8s pod restarts. | Inspect payload size and memory leak in worker; set container memory limits higher or stream large files. |
| **Long-Running Synchronous Tasks** | Job takes 45s without yielding to the event loop. | Increase `lockDuration: 60000` (60s) or insert periodic `await new Promise(r => setImmediate(r))` yields. |
| **Redis Network Latency** | High ping to Redis or overloaded Redis instance. | Verify Redis CPU/latency; ensure worker and Redis are in the same VPC/network zone. |

```typescript
// Worker configuration with custom lock settings for long-running jobs
const worker = new Worker('long-tasks', processor, {
  connection,
  lockDuration: 60000,   // Lock valid for 60 seconds
  lockRenewTime: 20000,  // Renew lock every 20 seconds
  stalledInterval: 60000,// Check for stalled jobs every 60 seconds
  maxStalledCount: 2     // Allow up to 2 stalled retries before permanent failure
});
```

---

## 2. Redis Memory & Eviction Policies

### Critical Redis Setting: `maxmemory-policy: noeviction`
If Redis reaches its memory limit with `volatile-lru` or `allkeys-lru`, Redis will silently evict BullMQ keys (hashes, sorted sets, streams). This corrupts queue state and leads to orphan jobs.

**Rule:** Always configure Redis with:
```text
maxmemory-policy noeviction
```

### Automatic Job Cleanup
Avoid unbounded Redis growth by always configuring retention policies:
```typescript
const queue = new Queue('data-pipeline', {
  connection,
  defaultJobOptions: {
    removeOnComplete: {
      count: 2000,      // Keep last 2,000 completed jobs
      age: 24 * 3600    // Keep for max 24 hours
    },
    removeOnFail: {
      count: 5000       // Keep last 5,000 failed jobs for debugging
    }
  }
});
```

---

## 3. Bull Board (Visual Dashboard)

Bull Board provides an interactive web UI to inspect queues, retry failed jobs, and monitor job states.

### Setup with Express
```typescript
import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from './queues/emailQueue';
import { reportsQueue } from './queues/reportsQueue';

const app = express();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(reportsQueue),
  ],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.listen(3000, () => {
  console.log('Bull Board running at http://localhost:3000/admin/queues');
});
```

---

## 4. Dead-Letter Queue (DLQ) Pattern

When a job exhausts all retry attempts:

```typescript
import { Worker, Job, Queue } from 'bullmq';

const dlq = new Queue('dead-letter-queue', { connection });

worker.on('failed', async (job: Job | undefined, err: Error) => {
  if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
    console.error(`Job ${job.id} permanently failed. Moving to DLQ.`);
    
    await dlq.add('failed-job', {
      originalQueue: job.queueName,
      originalJobId: job.id,
      data: job.data,
      failedReason: err.message,
      stacktrace: job.stacktrace,
      failedAt: new Date().toISOString(),
    });
  }
});
```
