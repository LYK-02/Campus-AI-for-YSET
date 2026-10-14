# Connection & Architecture Guide

## Redis Connection Management

BullMQ utilizes Redis commands ranging from simple key-value lookups to blocking stream commands (`XREAD`, `BRPOPLPUSH`, `BZPOPMIN`).

### 1. The `maxRetriesPerRequest: null` Mandate

By default, `ioredis` has a timeout retry limit on requests. If Redis has a momentary blip, `ioredis` will throw an error if retries are exceeded. However, BullMQ blocking commands intentionally stay open waiting for new jobs. If `maxRetriesPerRequest` is set to any number, the connection will drop and throw:

```text
Error: maxRetriesPerRequest reached
```

**Rule:** Always explicitly set `maxRetriesPerRequest: null`.

```typescript
import IORedis from 'ioredis';

export const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
```

---

### 2. Connection Sharing vs Dedicated Connections

- **Queues**: Multiple `Queue` instances can share the same Redis connection because queue operations are non-blocking atomic operations.
- **QueueEvents**: Each `QueueEvents` instance performs blocking reads and **must** have its own dedicated connection or be configured to use a connection factory.
- **Workers**: Each `Worker` instance performs blocking reads (`bpop` / streams) and **must** have its own connection.

```typescript
// Shared connection for standard queues
const sharedClient = new IORedis({ maxRetriesPerRequest: null });

const queueA = new Queue('queue-a', { connection: sharedClient });
const queueB = new Queue('queue-b', { connection: sharedClient });

// Dedicated connections for workers
const workerA = new Worker('queue-a', processorA, {
  connection: new IORedis({ maxRetriesPerRequest: null })
});

const workerB = new Worker('queue-b', processorB, {
  connection: new IORedis({ maxRetriesPerRequest: null })
});
```

---

### 3. Redis Cluster & Sentinel

#### Redis Sentinel
When running BullMQ in high-availability environments with Redis Sentinel:

```typescript
import IORedis from 'ioredis';

const sentinelConnection = new IORedis({
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
    { host: 'sentinel-3', port: 26379 },
  ],
  name: 'mymaster',
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
```

#### Redis Cluster
BullMQ supports Redis Cluster using hash tags `{}`. BullMQ prefixes queue keys with `{prefix:queueName}` to ensure all keys for a specific queue hash to the same cluster slot:

```typescript
import { Cluster } from 'ioredis';
import { Queue } from 'bullmq';

const cluster = new Cluster([
  { host: 'cluster-node-1', port: 6379 },
  { host: 'cluster-node-2', port: 6379 }
], {
  redisOptions: {
    maxRetriesPerRequest: null,
  }
});

const myQueue = new Queue('payments', {
  connection: cluster,
  prefix: '{bullmq}', // Ensures keys map to single node slot
});
```

---

### 4. Idempotency & Custom Job IDs

To guarantee exactly-once job insertion or deduplicate rapid webhooks:

```typescript
await emailQueue.add(
  'send-welcome',
  { userId: 'user_123', email: 'user@example.com' },
  {
    jobId: 'welcome-email:user_123', // Deduplication key
  }
);
```

- If a job with `jobId: 'welcome-email:user_123'` already exists in the queue (in `waiting`, `active`, or `delayed` status), BullMQ will ignore the duplicate `add` call.
- If the previous job has completed and was removed (due to `removeOnComplete`), a new job with the same ID can be added.
