/**
 * Mock job for testing
 */
export class MockJob<T = any> {
  id?: string;
  data: T;
  attemptsMade = 0;
  failedReason?: string;
  returnvalue?: any;
  opts: any = {};

  constructor(data: T, id?: string) {
    this.data = data;
    this.id = id || `mock-job-${Date.now()}-${Math.random()}`;
  }

  async update(data: Partial<T>): Promise<void> {
    this.data = { ...this.data, ...data };
  }

  async remove(): Promise<void> {
    // Mock implementation
  }

  async retry(): Promise<void> {
    this.attemptsMade++;
    this.failedReason = undefined;
  }

  async moveToFailed(error: Error, _token?: string): Promise<void> {
    this.failedReason = error.message;
  }
}

/**
 * Mock queue for testing
 */
export class MockQueue<T = any> {
  name: string;
  private jobs: Map<string, MockJob<T>> = new Map();
  private processors: Array<(job: MockJob<T>) => Promise<any>> = [];

  constructor(name: string) {
    this.name = name;
  }

  async add(name: string, data: T, options?: any): Promise<MockJob<T>> {
    const job = new MockJob<T>(data);
    job.opts = options || {};
    this.jobs.set(job.id!, job);

    // Auto-process if processors are registered
    if (this.processors.length > 0) {
      setImmediate(() => {
        void (async () => {
          for (const processor of this.processors) {
            try {
              job.returnvalue = await processor(job);
            } catch (error) {
              job.failedReason = (error as Error).message;
              job.attemptsMade++;
            }
          }
        })();
      });
    }

    return job;
  }

  async getJob(jobId: string): Promise<MockJob<T> | undefined> {
    return this.jobs.get(jobId);
  }

  async getJobs(
    types: string[],
    start?: number,
    end?: number,
  ): Promise<MockJob<T>[]> {
    const allJobs = Array.from(this.jobs.values());
    return allJobs.slice(start || 0, end);
  }

  async clean(
    _grace: number,
    limit: number,
    _type?: string,
  ): Promise<Array<{ id: string }>> {
    const cleaned: Array<{ id: string }> = [];

    for (const [id] of this.jobs.entries()) {
      // Simple cleanup logic - in real implementation this would check job age
      if (cleaned.length < limit) {
        cleaned.push({ id });
        this.jobs.delete(id);
      }
    }

    return cleaned;
  }

  async pause(): Promise<void> {
    // Mock implementation
  }

  async resume(): Promise<void> {
    // Mock implementation
  }

  async close(): Promise<void> {
    this.jobs.clear();
    this.processors = [];
  }

  // Helper methods for testing
  registerProcessor(processor: (job: MockJob<T>) => Promise<any>): void {
    this.processors.push(processor);
  }

  clear(): void {
    this.jobs.clear();
  }

  getJobCount(): number {
    return this.jobs.size;
  }
}

/**
 * Creates a mock queue instance
 */
export function createMockQueue<T = any>(name: string): MockQueue<T> {
  return new MockQueue<T>(name);
}
