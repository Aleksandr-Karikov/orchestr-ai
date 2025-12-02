/**
 * Mock Redis client for testing
 */
export class MockRedis {
  private data: Map<string, string> = new Map();
  private expires: Map<string, number> = new Map();

  async get(key: string): Promise<string | null> {
    const expireTime = this.expires.get(key);
    if (expireTime && Date.now() > expireTime) {
      this.data.delete(key);
      this.expires.delete(key);
      return null;
    }
    return this.data.get(key) || null;
  }

  async set(
    key: string,
    value: string,
    expiryMode?: string,
    time?: number,
  ): Promise<string> {
    this.data.set(key, value);
    if (expiryMode === "EX" && time) {
      this.expires.set(key, Date.now() + time * 1000);
    }
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (this.data.has(key)) {
        this.data.delete(key);
        this.expires.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  async exists(...keys: string[]): Promise<number> {
    return keys.filter((key) => this.data.has(key)).length;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
    );
    return Array.from(this.data.keys()).filter((key) => regex.test(key));
  }

  async flushdb(): Promise<string> {
    this.data.clear();
    this.expires.clear();
    return "OK";
  }

  async ping(): Promise<string> {
    return "PONG";
  }

  // Additional methods for testing
  clear(): void {
    this.data.clear();
    this.expires.clear();
  }

  has(key: string): boolean {
    return this.data.has(key);
  }
}

/**
 * Creates a mock Redis instance
 */
export function createMockRedis(): MockRedis {
  return new MockRedis();
}
