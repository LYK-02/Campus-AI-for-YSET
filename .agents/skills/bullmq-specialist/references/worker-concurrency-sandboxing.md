# Worker Concurrency & Sandboxed Processors

## 1. Concurrency vs Event Loop

In BullMQ, the `concurrency` option defines how many jobs a single `Worker` instance processes simultaneously:

```typescript
const worker = new Worker('report-queue', processJob, {
  connection,
  concurrency: 20 // 20 concurrent jobs
});
```

### When High Concurrency Works Well:
- **I/O-bound tasks**: Fetching third-party APIs, sending emails, querying databases, downloading files.
- In these cases, the Node.js event loop spends most of its time waiting for network sockets. A single process can easily run 20 to 100 concurrent jobs.

### When High Concurrency Breaks:
- **CPU-bound tasks**: Image rendering, video encoding, heavy CSV/Excel processing, PDF generation, cryptographic computation.
- If synchronous CPU work takes more than 100ms, it freezes the Node.js event loop.
- **The Stalled Job Problem**: During event loop freezes, BullMQ cannot renew the job's Redis lock. Another worker will assume the job crashed, mark it as stalled, and re-execute it, leading to duplicate processing and crash loops.

---

## 2. Sandboxed Processors (Child Processes)

To handle CPU-heavy workloads safely, BullMQ supports **Sandboxed Processors**. The worker runs the processor code in separate Node.js child processes or worker threads.

### Step 1: Create the Processor File (`sandboxedProcessor.js` / `.ts`)

The processor file must export a default async function:

```typescript
// processor.ts
import { SandboxedJob } from 'bullmq';

export default async function (job: SandboxedJob<{ filePath: string }>) {
  job.log(`Starting CPU heavy processing for job ${job.id}`);
  
  // CPU-heavy operation (safe from blocking main event loop)
  const result = await processHeavyFile(job.data.filePath);

  return { success: true, processedBytes: result.length };
}
```

### Step 2: Configure Worker with the File Path

Pass the absolute or resolved path of the processor file to the `Worker`:

```typescript
import path from 'path';
import { Worker } from 'bullmq';
import { createRedisConnection } from './redis';

const processorPath = path.join(__dirname, 'processor.js');

export const sandboxedWorker = new Worker(
  'heavy-tasks',
  processorPath,
  {
    connection: createRedisConnection(),
    concurrency: 4, // Spawns up to 4 parallel worker processes
    useWorkerThreads: true // Recommended: uses worker threads instead of full child processes
  }
);
```

> **Note on TypeScript / TS-Node:** In production, point to the compiled `.js` file (e.g., `dist/processor.js`). If running with `tsx` or `ts-node` in development, configure the path accordingly or register the TS loader.

---

## 3. Sandboxed Worker Options & Best Practices

| Option | Recommended Setting | Rationale |
| :--- | :--- | :--- |
| `useWorkerThreads` | `true` | Lighter memory footprint and faster startup than `child_process.fork()` |
| `concurrency` | `os.cpus().length - 1` | For CPU-bound tasks, concurrency should not exceed available CPU cores |
| `lockDuration` | `60000` (60s) | Allow sufficient buffer for heavy execution steps |

### Graceful Termination of Sandboxed Workers
```typescript
const shutdown = async () => {
  // Waits for active sandboxed tasks to complete or timeout
  await sandboxedWorker.close();
};
```
