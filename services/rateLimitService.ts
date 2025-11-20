/**
 * Rate Limiting Service
 * Manages API rate limiting and quota management
 */

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface UserQuota {
  userId: string;
  requestsThisMinute: number;
  requestsThisHour: number;
  requestsThisDay: number;
  lastResetMinute: number;
  lastResetHour: number;
  lastResetDay: number;
  isThrottled: boolean;
}

export interface RateLimitStats {
  totalRequests: number;
  throttledRequests: number;
  blockedRequests: number;
  averageResponseTime: number;
}

class RateLimitService {
  private readonly QUOTA_KEY = 'wow_class_helper_user_quotas';
  private readonly STATS_KEY = 'wow_class_helper_rate_limit_stats';
  private readonly CONFIG_KEY = 'wow_class_helper_rate_limit_config';

  private config: RateLimitConfig = {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 10,
  };

  constructor() {
    this.loadConfig();
  }

  /**
   * Check if request is allowed
   */
  isRequestAllowed(userId: string): boolean {
    const quota = this.getOrCreateQuota(userId);

    // Check minute limit
    if (quota.requestsThisMinute >= this.config.requestsPerMinute) {
      quota.isThrottled = true;
      this.saveQuota(quota);
      return false;
    }

    // Check hour limit
    if (quota.requestsThisHour >= this.config.requestsPerHour) {
      quota.isThrottled = true;
      this.saveQuota(quota);
      return false;
    }

    // Check day limit
    if (quota.requestsThisDay >= this.config.requestsPerDay) {
      quota.isThrottled = true;
      this.saveQuota(quota);
      return false;
    }

    return true;
  }

  /**
   * Record request
   */
  recordRequest(userId: string): void {
    const quota = this.getOrCreateQuota(userId);

    quota.requestsThisMinute++;
    quota.requestsThisHour++;
    quota.requestsThisDay++;

    // Reset if time has passed
    const now = Date.now();
    if (now - quota.lastResetMinute > 60000) {
      quota.requestsThisMinute = 1;
      quota.lastResetMinute = now;
    }

    if (now - quota.lastResetHour > 3600000) {
      quota.requestsThisHour = 1;
      quota.lastResetHour = now;
    }

    if (now - quota.lastResetDay > 86400000) {
      quota.requestsThisDay = 1;
      quota.lastResetDay = now;
    }

    quota.isThrottled = false;
    this.saveQuota(quota);
  }

  /**
   * Get remaining quota
   */
  getRemainingQuota(userId: string): {
    minuteRemaining: number;
    hourRemaining: number;
    dayRemaining: number;
  } {
    const quota = this.getOrCreateQuota(userId);

    return {
      minuteRemaining: Math.max(0, this.config.requestsPerMinute - quota.requestsThisMinute),
      hourRemaining: Math.max(0, this.config.requestsPerHour - quota.requestsThisHour),
      dayRemaining: Math.max(0, this.config.requestsPerDay - quota.requestsThisDay),
    };
  }

  /**
   * Get user quota
   */
  getUserQuota(userId: string): UserQuota {
    return this.getOrCreateQuota(userId);
  }

  /**
   * Reset user quota
   */
  resetUserQuota(userId: string): void {
    try {
      const data = localStorage.getItem(this.QUOTA_KEY);
      if (!data) return;

      const quotas: UserQuota[] = JSON.parse(data);
      const quota = quotas.find((q) => q.userId === userId);

      if (quota) {
        quota.requestsThisMinute = 0;
        quota.requestsThisHour = 0;
        quota.requestsThisDay = 0;
        quota.lastResetMinute = Date.now();
        quota.lastResetHour = Date.now();
        quota.lastResetDay = Date.now();
        quota.isThrottled = false;

        localStorage.setItem(this.QUOTA_KEY, JSON.stringify(quotas));
      }
    } catch {
      console.error('Failed to reset quota');
    }
  }

  /**
   * Get rate limit configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Update rate limit configuration
   */
  updateConfig(updates: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Get rate limit statistics
   */
  getStats(): RateLimitStats {
    try {
      const data = localStorage.getItem(this.STATS_KEY);
      if (!data) {
        return {
          totalRequests: 0,
          throttledRequests: 0,
          blockedRequests: 0,
          averageResponseTime: 0,
        };
      }

      const stats = JSON.parse(data);
      return stats;
    } catch {
      return {
        totalRequests: 0,
        throttledRequests: 0,
        blockedRequests: 0,
        averageResponseTime: 0,
      };
    }
  }

  /**
   * Record throttled request
   */
  recordThrottledRequest(): void {
    try {
      const data = localStorage.getItem(this.STATS_KEY);
      const stats = data ? JSON.parse(data) : this.getStats();

      stats.throttledRequests++;
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch {
      console.error('Failed to record throttled request');
    }
  }

  /**
   * Get throttled users
   */
  getThrottledUsers(): string[] {
    try {
      const data = localStorage.getItem(this.QUOTA_KEY);
      if (!data) return [];

      const quotas: UserQuota[] = JSON.parse(data);
      return quotas.filter((q) => q.isThrottled).map((q) => q.userId);
    } catch {
      return [];
    }
  }

  // Private helper methods

  private getOrCreateQuota(userId: string): UserQuota {
    try {
      const data = localStorage.getItem(this.QUOTA_KEY);
      const quotas: UserQuota[] = data ? JSON.parse(data) : [];

      let quota = quotas.find((q) => q.userId === userId);

      if (!quota) {
        quota = {
          userId,
          requestsThisMinute: 0,
          requestsThisHour: 0,
          requestsThisDay: 0,
          lastResetMinute: Date.now(),
          lastResetHour: Date.now(),
          lastResetDay: Date.now(),
          isThrottled: false,
        };

        quotas.push(quota);
        localStorage.setItem(this.QUOTA_KEY, JSON.stringify(quotas));
      }

      return quota;
    } catch {
      return {
        userId,
        requestsThisMinute: 0,
        requestsThisHour: 0,
        requestsThisDay: 0,
        lastResetMinute: Date.now(),
        lastResetHour: Date.now(),
        lastResetDay: Date.now(),
        isThrottled: false,
      };
    }
  }

  private saveQuota(quota: UserQuota): void {
    try {
      const data = localStorage.getItem(this.QUOTA_KEY);
      const quotas: UserQuota[] = data ? JSON.parse(data) : [];

      const index = quotas.findIndex((q) => q.userId === quota.userId);
      if (index >= 0) {
        quotas[index] = quota;
      } else {
        quotas.push(quota);
      }

      localStorage.setItem(this.QUOTA_KEY, JSON.stringify(quotas));
    } catch {
      console.error('Failed to save quota');
    }
  }

  private loadConfig(): void {
    try {
      const data = localStorage.getItem(this.CONFIG_KEY);
      if (data) {
        this.config = JSON.parse(data);
      }
    } catch {
      console.error('Failed to load config');
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
    } catch {
      console.error('Failed to save config');
    }
  }
}

export const rateLimitService = new RateLimitService();
