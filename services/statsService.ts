/**
 * Statistics Service
 * Tracks API calls, cache hits, mock usage, and success rates
 */

interface ApiStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  mockDataUsage: number;
  cacheHits: number;
  lastUpdated: Date;
}

export interface DetailedStats extends ApiStats {
  successRate: number;
  failureRate: number;
  cacheHitRate: number;
  mockUsageRate: number;
}

class StatsService {
  private stats: ApiStats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    mockDataUsage: 0,
    cacheHits: 0,
    lastUpdated: new Date(),
  };

  /**
   * Record a successful API call
   */
  recordApiSuccess(): void {
    this.stats.totalCalls++;
    this.stats.successfulCalls++;
    this.stats.lastUpdated = new Date();
    this.saveToStorage();
  }

  /**
   * Record a failed API call
   */
  recordApiFailure(): void {
    this.stats.totalCalls++;
    this.stats.failedCalls++;
    this.stats.lastUpdated = new Date();
    this.saveToStorage();
  }

  /**
   * Record mock data usage
   */
  recordMockUsage(): void {
    this.stats.mockDataUsage++;
    this.stats.lastUpdated = new Date();
    this.saveToStorage();
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.stats.cacheHits++;
    this.stats.lastUpdated = new Date();
    this.saveToStorage();
  }

  /**
   * Get detailed statistics with calculated rates
   */
  getStats(): DetailedStats {
    const successRate = this.stats.totalCalls > 0 
      ? Math.round((this.stats.successfulCalls / this.stats.totalCalls) * 100)
      : 0;
    
    const failureRate = this.stats.totalCalls > 0
      ? Math.round((this.stats.failedCalls / this.stats.totalCalls) * 100)
      : 0;
    
    const totalRequests = this.stats.totalCalls + this.stats.cacheHits;
    const cacheHitRate = totalRequests > 0
      ? Math.round((this.stats.cacheHits / totalRequests) * 100)
      : 0;
    
    const mockUsageRate = this.stats.totalCalls > 0
      ? Math.round((this.stats.mockDataUsage / this.stats.totalCalls) * 100)
      : 0;

    return {
      ...this.stats,
      successRate,
      failureRate,
      cacheHitRate,
      mockUsageRate,
    };
  }

  /**
   * Reset all statistics
   */
  reset(): void {
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      mockDataUsage: 0,
      cacheHits: 0,
      lastUpdated: new Date(),
    };
    this.saveToStorage();
  }

  /**
   * Save stats to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('wow_class_helper_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Failed to save stats to localStorage:', error);
    }
  }

  /**
   * Load stats from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_stats');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.stats = {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        };
      }
    } catch (error) {
      console.warn('Failed to load stats from localStorage:', error);
    }
  }

  /**
   * Initialize the service
   */
  init(): void {
    this.loadFromStorage();
  }
}

// Create singleton instance
export const statsService = new StatsService();

// Initialize on import
statsService.init();
