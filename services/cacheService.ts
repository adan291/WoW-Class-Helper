/**
 * Cache service for storing guide content with TTL support
 * Implements 1-hour TTL for cached entries
 */

export interface CacheMetadata {
  key: string;
  timestamp: number;
  ttl: number;
  size: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

class CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Generates a cache key from content parameters
   */
  generateKey(
    wowClass: string,
    spec: string,
    tab: string,
    dungeon?: string
  ): string {
    const parts = [wowClass, spec, tab];
    if (dungeon) parts.push(dungeon);
    return parts.join(':');
  }

  /**
   * Gets a value from cache if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Sets a value in cache with current timestamp
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Checks if a key exists and is still valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > CACHE_TTL_MS) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Invalidates all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidates cache entries matching a pattern
   * Useful when custom source URLs change
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Gets cache statistics for debugging
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Gets metadata for a cached entry
   */
  getMetadata(key: string): CacheMetadata | null {
    const entry = this.cache.get(key) as CacheEntry<unknown> | undefined;
    if (!entry) return null;

    return {
      key,
      timestamp: entry.timestamp,
      ttl: CACHE_TTL_MS,
      size: JSON.stringify(entry.data).length,
    };
  }

  /**
   * Gets all cache metadata
   */
  getAllMetadata(): CacheMetadata[] {
    const metadata: CacheMetadata[] = [];
    this.cache.forEach((entry, key) => {
      metadata.push({
        key,
        timestamp: entry.timestamp,
        ttl: CACHE_TTL_MS,
        size: JSON.stringify(entry.data).length,
      });
    });
    return metadata;
  }
}

export const cacheService = new CacheService();
