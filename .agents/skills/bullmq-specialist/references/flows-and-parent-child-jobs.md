# Flows & Parent-Child Jobs Guide

## 1. FlowProducer (Job Dependency Trees)

BullMQ's `FlowProducer` allows you to construct Directed Acyclic Graphs (DAGs) and trees of dependent jobs. 

### Core Rule:
**Children execute first.** The parent job stays in the `waiting-children` state until all of its children have completed successfully.

### Example: Video Processing Pipeline

```text
[ Parent: Finalize Video & Notify ] (Runs Last)
         ▲                ▲
         │                │
[ Child 1: Encode 1080p ] [ Child 2: Generate Thumbnails ]
```

```typescript
import { FlowProducer } from 'bullmq';
import { createRedisConnection } from './redis';

const flowProducer = new FlowProducer({
  connection: createRedisConnection()
});

export const scheduleVideoPipeline = async (videoId: string, rawUrl: string) => {
  const flow = await flowProducer.add({
    name: 'finalize-video',
    queueName: 'video-finalize-queue',
    data: { videoId },
    children: [
      {
        name: 'encode-1080p',
        queueName: 'video-encode-queue',
        data: { videoId, rawUrl, resolution: '1080p' },
        opts: {
          failParentOnFailure: true // If encoding fails, abort parent
        }
      },
      {
        name: 'generate-thumbnails',
        queueName: 'video-thumbnail-queue',
        data: { videoId, rawUrl },
        opts: {
          failParentOnFailure: false // Thumbnails are non-critical
        }
      }
    ]
  });

  return flow;
};
```

---

### Reading Child Results in the Parent Worker

Inside the parent job's processor, access the return values of all child jobs using `job.getChildrenValues()`:

```typescript
import { Worker, Job } from 'bullmq';

export const finalizeWorker = new Worker(
  'video-finalize-queue',
  async (job: Job) => {
    // Returns a dictionary keyed by child job ID / queue
    const childrenValues = await job.getChildrenValues();
    
    console.log('Child results received:', childrenValues);

    return { status: 'published', videoId: job.data.videoId };
  },
  { connection: createRedisConnection() }
);
```

---

## 2. Repeatable & Cron Jobs

Repeatable jobs are managed by BullMQ using Redis Sorted Sets to trigger tasks on schedules.

### Adding a Cron Job
```typescript
await reportsQueue.add(
  'daily-analytics-report',
  { department: 'finance' },
  {
    repeat: {
      pattern: '0 2 * * *', // Every day at 02:00 AM
      tz: 'America/New_York', // ALWAYS specify timezone
    },
    jobId: 'daily-report-finance',
  }
);
```

### Critical Rules for Repeatable Jobs:
1. **Always Specify Timezone (`tz`)**: Avoid UTC surprises during daylight saving time (DST) shifts.
2. **Deterministic `jobId` or Name**: Ensure you do not register duplicate repeatable job definitions on application restarts.
3. **Removing Repeatable Jobs**:
   To remove a repeatable job, you must pass the exact same name, pattern, and opts:

```typescript
await reportsQueue.removeRepeatable(
  'daily-analytics-report',
  {
    pattern: '0 2 * * *',
    tz: 'America/New_York'
  }
);
```

Or list and remove them programmatically:
```typescript
const repeatableJobs = await reportsQueue.getRepeatableJobs();
for (const job of repeatableJobs) {
  if (job.name === 'daily-analytics-report') {
    await reportsQueue.removeRepeatableByKey(job.key);
  }
}
```

---

## 3. Delayed Jobs

To delay execution by a specific duration:

```typescript
await notificationQueue.add(
  'follow-up-reminder',
  { userId: 'user_456' },
  {
    delay: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  }
);
```
