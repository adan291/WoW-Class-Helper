/**
 * Performance Monitor Service
 * Tracks and analyzes performance metrics
 */

export interface PerformanceMetric {
  timestamp: Date;
  duration: number; // milliseconds
  type: 'api' | 'cache' | 'render';
  success: boolean;
  error?: string;
}

export interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: number;
  errorRate: number;
  uptime: number; // percentage
}

class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;
  private startTime = Date.now();

  /**
   * Record a performance metric
   */
  recordMetric(
    type: 'api' | 'cache' | 'render',
    duration: number,
    success: boolean,
    error?: string
  ): void {
    const metric: PerformanceMetric = {
      timestamp: new Date(),
      duration,
      type,
      success,
      error,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    this.saveMetrics();
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        uptime: 100,
      };
    }

    const durations = this.metrics.map(m => m.duration);
    const successCount = this.metrics.filter(m => m.success).length;
    const errorCount = this.metrics.length - successCount;

    const uptime = ((Date.now() - this.startTime) / 1000 / 60) * 100; // Simplified

    return {
      totalRequests: this.metrics.length,
      averageResponseTime: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      minResponseTime: Math.min(...durations),
      maxResponseTime: Math.max(...durations),
      successRate: Math.round((successCount / this.metrics.length) * 100),
      errorRate: Math.round((errorCount / this.metrics.length) * 100),
      uptime: Math.min(100, uptime),
    };
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: 'api' | 'cache' | 'render'): PerformanceMetric[] {
    return this.metrics.filter(m => m.type === type);
  }

  /**
   * Get metrics from last N minutes
   */
  getRecentMetrics(minutes: number): PerformanceMetric[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.metrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  /**
   * Get error metrics
   */
  getErrors(): PerformanceMetric[] {
    return this.metrics.filter(m => !m.success);
  }

  /**
   * Get average response time by type
   */
  getAverageByType(type: 'api' | 'cache' | 'render'): number {
    const typeMetrics = this.getMetricsByType(type);
    if (typeMetrics.length === 0) return 0;
    return Math.round(
      typeMetrics.reduce((sum, m) => sum + m.duration, 0) / typeMetrics.length
    );
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.startTime = Date.now();
    localStorage.removeItem('wow_class_helper_performance_metrics');
  }

  /**
   * Save metrics to localStorage
   */
  private saveMetrics(): void {
    try {
      const data = this.metrics.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      }));
      localStorage.setItem('wow_class_helper_performance_metrics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save performance metrics:', error);
    }
  }

  /**
   * Load metrics from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_performance_metrics');
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = data.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to load performance metrics:', error);
    }
  }
}

export const performanceMonitorService = new PerformanceMonitorService();
performanceMonitorService.load();
