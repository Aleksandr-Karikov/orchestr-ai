import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ConfigModule } from "@nestjs/config";
import { QueueModule } from "../../../src/queue/queue.module";
import { RedisModule, REDIS_CLIENT } from "../../../src/redis/redis.module";
import Redis from "ioredis";

describe("Queue Integration Tests", () => {
  let module: TestingModule;
  let indexingQueue: Queue;
  let redisClient: Redis;

  beforeAll(async () => {
    // Use test Redis configuration
    process.env.REDIS_HOST = process.env.REDIS_HOST || "localhost";
    process.env.REDIS_PORT = process.env.REDIS_PORT || "6379";
    process.env.REDIS_DB = process.env.REDIS_DB || "1"; // Use DB 1 for tests

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        RedisModule,
        QueueModule,
      ],
    }).compile();

    indexingQueue = module.get<Queue>(getQueueToken("indexing"));
    redisClient = module.get<Redis>(REDIS_CLIENT);
  });

  afterAll(async () => {
    // Clean up all jobs
    if (indexingQueue) {
      await indexingQueue.obliterate({ force: true });
      await indexingQueue.close();
    }
    // Close Redis connection and wait for it to close
    if (redisClient) {
      await redisClient.quit();
      // Wait a bit for Redis to fully close before Jest finishes
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await module.close();
  });

  beforeEach(async () => {
    // Clean up jobs before each test
    if (indexingQueue) {
      await indexingQueue.obliterate({ force: true });
    }
  });

  describe("Queue Job Creation", () => {
    it("should create a job in the indexing queue", async () => {
      const jobData = {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      };

      const job = await indexingQueue.add("index-service", jobData);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.data).toEqual(jobData);
      expect(job.name).toBe("index-service");
    });

    it("should create multiple jobs in the queue", async () => {
      const jobs = await Promise.all([
        indexingQueue.add("index-service", {
          serviceId: "service-1",
          repositoryUrl: "https://github.com/test/repo1",
        }),
        indexingQueue.add("index-service", {
          serviceId: "service-2",
          repositoryUrl: "https://github.com/test/repo2",
        }),
        indexingQueue.add("index-service", {
          serviceId: "service-3",
          repositoryUrl: "https://github.com/test/repo3",
        }),
      ]);

      expect(jobs).toHaveLength(3);
      expect(jobs[0].id).toBeDefined();
      expect(jobs[1].id).toBeDefined();
      expect(jobs[2].id).toBeDefined();
    });

    it("should create jobs with custom options", async () => {
      const jobData = {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      };

      const job = await indexingQueue.add("index-service", jobData, {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        delay: 1000, // Delay execution by 1 second
      });

      expect(job).toBeDefined();
      expect(job.opts.attempts).toBe(5);
      expect(typeof job.opts.backoff).toBe("object");
      expect(job.opts.backoff).not.toBeNull();
      if (typeof job.opts.backoff === "object" && job.opts.backoff !== null) {
        expect(job.opts.backoff.type).toBe("exponential");
        expect(job.opts.backoff.delay).toBe(1000);
      }
    });
  });

  describe("Queue Job Retrieval", () => {
    it("should retrieve a job by ID", async () => {
      const jobData = {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      };

      const createdJob = await indexingQueue.add("index-service", jobData);
      const retrievedJob = await indexingQueue.getJob(createdJob.id!);

      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.id).toBe(createdJob.id);
      expect(retrievedJob?.data).toEqual(jobData);
    });

    it("should get waiting jobs", async () => {
      await indexingQueue.add("index-service", {
        serviceId: "service-1",
        repositoryUrl: "https://github.com/test/repo1",
      });
      await indexingQueue.add("index-service", {
        serviceId: "service-2",
        repositoryUrl: "https://github.com/test/repo2",
      });

      const waitingJobs = await indexingQueue.getWaiting();

      expect(waitingJobs.length).toBeGreaterThanOrEqual(2);
    });

    it("should get active jobs", async () => {
      const _job = await indexingQueue.add("index-service", {
        serviceId: "service-1",
        repositoryUrl: "https://github.com/test/repo1",
      });

      // Note: Jobs will only be active if a worker is processing them
      // In a test environment without workers, this will be empty
      const activeJobs = await indexingQueue.getActive();

      expect(Array.isArray(activeJobs)).toBe(true);
    });

    it("should get completed jobs", async () => {
      const _job = await indexingQueue.add("index-service", {
        serviceId: "service-1",
        repositoryUrl: "https://github.com/test/repo1",
      });

      // Note: Jobs will only be completed if processed by a worker
      const completedJobs = await indexingQueue.getCompleted();

      expect(Array.isArray(completedJobs)).toBe(true);
    });

    it("should get failed jobs", async () => {
      const _job = await indexingQueue.add("index-service", {
        serviceId: "service-1",
        repositoryUrl: "https://github.com/test/repo1",
      });

      // Note: Jobs will only be failed if they fail during processing
      const failedJobs = await indexingQueue.getFailed();

      expect(Array.isArray(failedJobs)).toBe(true);
    });
  });

  describe("Queue Job Management", () => {
    it("should remove a job from the queue", async () => {
      const job = await indexingQueue.add("index-service", {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      });

      const jobId = job.id!;
      await job.remove();

      const retrievedJob = await indexingQueue.getJob(jobId);
      // BullMQ returns undefined when job is not found
      expect(retrievedJob).toBeUndefined();
    });

    it("should retry a failed job", async () => {
      const job = await indexingQueue.add("index-service", {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      });

      // Note: In a real scenario, the job would need to fail first
      // This test verifies the retry method exists and can be called
      expect(job.retry).toBeDefined();
      expect(typeof job.retry).toBe("function");
    });

    it("should clean completed jobs", async () => {
      // Add some jobs
      await indexingQueue.add("index-service", {
        serviceId: "service-1",
        repositoryUrl: "https://github.com/test/repo1",
      });
      await indexingQueue.add("index-service", {
        serviceId: "service-2",
        repositoryUrl: "https://github.com/test/repo2",
      });

      // Clean jobs older than 0 seconds (all jobs)
      const cleaned = await indexingQueue.clean(0, 100, "completed");

      expect(Array.isArray(cleaned)).toBe(true);
    });

    it("should clean failed jobs", async () => {
      // Add some jobs
      await indexingQueue.add("index-service", {
        serviceId: "service-1",
        repositoryUrl: "https://github.com/test/repo1",
      });

      // Clean failed jobs older than 0 seconds
      const cleaned = await indexingQueue.clean(0, 100, "failed");

      expect(Array.isArray(cleaned)).toBe(true);
    });
  });

  describe("Queue Configuration", () => {
    it("should have correct queue name", () => {
      expect(indexingQueue.name).toBe("indexing");
    });

    it("should have default job options configured", async () => {
      const job = await indexingQueue.add("index-service", {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      });

      // Check that default options from queue configuration are applied
      expect(job.opts.attempts).toBe(3); // From queue.module.ts
      expect(typeof job.opts.backoff).toBe("object");
      expect(job.opts.backoff).not.toBeNull();
      if (typeof job.opts.backoff === "object" && job.opts.backoff !== null) {
        expect(job.opts.backoff.type).toBe("exponential");
        expect(job.opts.backoff.delay).toBe(2000);
      }
    });

    it("should support pausing and resuming the queue", async () => {
      await indexingQueue.pause();
      const isPaused = await indexingQueue.isPaused();
      expect(isPaused).toBe(true);

      await indexingQueue.resume();
      const isPausedAfterResume = await indexingQueue.isPaused();
      expect(isPausedAfterResume).toBe(false);
    });
  });

  describe("Queue Job Status", () => {
    it("should track job state", async () => {
      const job = await indexingQueue.add("index-service", {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      });

      const state = await job.getState();
      expect(["waiting", "active", "completed", "failed", "delayed"]).toContain(
        state,
      );
    });

    it("should update job progress", async () => {
      const job = await indexingQueue.add("index-service", {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      });

      await job.updateProgress(50);
      const progress = await job.progress;
      expect(progress).toBe(50);
    });

    it("should update job data", async () => {
      const job = await indexingQueue.add("index-service", {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
      });

      const updatedData = {
        serviceId: "test-service-id",
        repositoryUrl: "https://github.com/test/repo",
        status: "processing",
      };

      await job.updateData(updatedData);
      const retrievedJob = await indexingQueue.getJob(job.id!);
      expect(retrievedJob?.data).toEqual(updatedData);
    });
  });

  describe("Queue Connection", () => {
    it("should connect to Redis successfully", async () => {
      // If we can add a job, Redis connection is working
      const job = await indexingQueue.add("test-connection", {
        test: true,
      });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
    });

    it("should handle queue operations without errors", async () => {
      // Test multiple operations to ensure connection stability
      const job1 = await indexingQueue.add("test", { id: 1 });
      const job2 = await indexingQueue.add("test", { id: 2 });

      const retrieved1 = await indexingQueue.getJob(job1.id!);
      const retrieved2 = await indexingQueue.getJob(job2.id!);

      expect(retrieved1).toBeDefined();
      expect(retrieved2).toBeDefined();

      await job1.remove();
      await job2.remove();
    });
  });
});
