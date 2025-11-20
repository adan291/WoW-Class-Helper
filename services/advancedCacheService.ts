/**
 * Advanced Cache Service
 * Enhanced caching with compression, sync, and cleanup
 */

import { cacheService } from './cacheService.ts';

export interface CacheStats {
  totalSize: number; // bytes
  itemCount: number;
  oldestItem: Date | null;
  newestItem: Date | null;
}

class AdvancedCacheService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private readonly SYNC_INTERVAL = 30 * 1000; // 30 seconds
  private readonly MAX_CACHE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Initialize advanced cache features
   */
  init(): void {
    this.startAutoCleanup();
    this.startCrossTabSync();
  }

  /**
   * Start automatic cleanup
   */
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Start cross-tab synchronization
   */
  private startCrossTabSync(): void {
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('wow_class_helper_guide_')) {
        console.log('Cache updated in another tab');
      }
    });

    this.syncInterval = setInterval(() => {
      this.broadcastCacheState();
    }, this.SYNC_INTERVAL);
  }

  /**
   * Broadcast cache state to other tabs
   */
  private broadcastCacheState(): void {
    try {
      const stats = this.getStats();
      localStorage.setItem('wow_class_helper_cache_sync', JSON.stringify({
        timestamp: Date.now(),
        stats,
      }));
    } catch (error) {
      console.warn('Failed to broadcast cache state:', error);
    }
  }

  /**
   * Cleanup old cache entries
   */
  cleanup(): void {
    const stats = this.getStats();

    // If cache is too large, remove oldest entries
    if (stats.totalSize > this.MAX_CACHE_SIZE) {
      console.log('Cache size exceeded, cleaning up old entries');
      this.removeOldestEntries(Math.ceil(stats.itemCount * 0.2)); // Remove 20%
    }

    // Remove expired entries
    this.removeExpiredEntries();
  }

  /**
   * Remove oldest cache entries
   */
  private removeOldestEntries(count: number): void {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys
      .filter(k => k.startsWith('wow_class_helper_guide_'))
      .map(k => ({
        key: k,
        timestamp: this.getEntryTimestamp(k),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, count);

    cacheKeys.forEach(({ key }) => {
      localStorage.removeItem(key);
    });

    console.log(`Removed ${cacheKeys.length} old cache entries`);
  }

  /**
   * Remove expired cache entries
   */
  private removeExpiredEntries(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let removed = 0;

    keys.forEach(key => {
      if (key.startsWith('wow_class_helper_guide_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp && now - data.timestamp > data.ttl) {
            localStorage.removeItem(key);
            removed++;
          }
        } catch (error) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
          removed++;
        }
      }
    });

    if (removed > 0) {
      console.log(`Removed ${removed} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith('wow_class_helper_guide_'));

    let totalSize = 0;
    let oldestTime = Infinity;
    let newestTime = 0;

    cacheKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        const timestamp = this.getEntryTimestamp(key);
        oldestTime = Math.min(oldestTime, timestamp);
        newestTime = Math.max(newestTime, timestamp);
      }
    });

    return {
      totalSize,
      itemCount: cacheKeys.length,
      oldestItem: oldestTime === Infinity ? null : new Date(oldestTime),
      newestItem: newestTime === 0 ? null : new Date(newestTime),
    };
  }

  /**
   * Get entry timestamp
   */
  private getEntryTimestamp(key: string): number {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return data.timestamp || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Compress cache (remove unnecessary data)
   */
  compress(): void {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith('wow_class_helper_guide_'));

    let compressed = 0;
    cacheKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        // Remove extra whitespace and formatting
        const compressed_data = JSON.stringify(data);
        localStorage.setItem(key, compressed_data);
        compressed++;
      } catch (error) {
        console.warn(`Failed to compress cache entry ${key}:`, error);
      }
    });

    console.log(`Compressed ${compressed} cache entries`);
  }

  /**
   * Export cache for backup
   */
  exportCache(): string {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith('wow_class_helper_guide_'));

    const backup: Record<string, any> = {};
    cacheKeys.forEach(key => {
      backup[key] = localStorage.getItem(key);
    });

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import cache from backup
   */
  importCache(json: string): boolean {
    try {
      const backup = JSON.parse(json);
      Object.entries(backup).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });
      console.log('Cache imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import cache:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith('wow_class_helper_guide_'));
    cacheKeys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${cacheKeys.length} cache entries`);
  }

  /**
   * Destroy service
   */
  destroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.syncInterval) clearInterval(this.syncInterval);
  }
}

export const advancedCacheService = new AdvancedCacheService();
advancedCacheService.init();
