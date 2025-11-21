/**
 * Performance Optimizer Service
 * Provides utilities for monitoring and optimizing application performance
 */

export interface PerformanceMetrics {
  navigationTiming: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
  };
  resourceTiming: {
    totalResources: number;
    totalSize: number;
    averageSize: number;
  };
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  customMetrics: Record<string, number>;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    navigationTiming: {
      domContentLoaded: 0,
      loadComplete: 0,
      firstPaint: 0,
    },
    resourceTiming: {
      totalResources: 0,
      totalSize: 0,
      averageSize: 0,
    },
    customMetrics: {},
  };

  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Capture navigation timing
    window.addEventListener('load', () => {
      this.captureNavigationTiming();
      this.captureResourceTiming();
    });

    // Capture first paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-paint') {
              this.metrics.navigationTiming.firstPaint = entry.startTime;
            }
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported');
      }
    }
  }

  /**
   * Capture navigation timing metrics
   */
  private captureNavigationTiming(): void {
    if (typeof window === 'undefined') return;

    const perfData = window.performance.timing;
    const perfNav = window.performance.navigation;

    this.metrics.navigationTiming.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    this.metrics.navigationTiming.loadComplete = perfData.loadEventEnd - perfData.navigationStart;
  }

  /**
   * Capture resource timing metrics
   */
  private captureResourceTiming(): void {
    if (typeof window === 'undefined') return;

    const resources = window.performance.getEntriesByType('resource');
    let totalSize = 0;

    resources.forEach((resource) => {
      if ('transferSize' in resource) {
        totalSize += (resource as PerformanceResourceTiming).transferSize || 0;
      }
    });

    this.metrics.resourceTiming.totalResources = resources.length;
    this.metrics.resourceTiming.totalSize = totalSize;
    this.metrics.resourceTiming.averageSize = resources.length > 0 ? totalSize / resources.length : 0;
  }

  /**
   * Mark a performance point
   */
  mark(name: string): void {
    if (typeof window === 'undefined') return;

    const timestamp = performance.now();
    this.marks.set(name, timestamp);

    if ('mark' in performance) {
      try {
        performance.mark(name);
      } catch (e) {
        console.warn(`Failed to mark: ${name}`);
      }
    }
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string): number {
    if (typeof window === 'undefined') return 0;

    const startTime = this.marks.get(startMark) || 0;
    const endTime = this.marks.get(endMark) || performance.now();
    const duration = endTime - startTime;

    this.measures.set(name, duration);

    if ('measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {
        console.warn(`Failed to measure: ${name}`);
      }
    }

    return duration;
  }

  /**
   * Record custom metric
   */
  recordMetric(name: string, value: number): void {
    this.metrics.customMetrics[name] = value;
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetrics {
    // Capture memory usage if available
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }

    return { ...this.metrics };
  }

  /**
   * Get specific metric
   */
  getMetric(name: string): number | undefined {
    return this.metrics.customMetrics[name];
  }

  /**
   * Get all marks
   */
  getMarks(): Record<string, number> {
    return Object.fromEntries(this.marks);
  }

  /**
   * Get all measures
   */
  getMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  /**
   * Clear marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures.clear();
    this.metrics.customMetrics = {};
  }

  /**
   * Log performance report
   */
  logReport(): void {
    const metrics = this.getMetrics();
    console.group('📊 Performance Report');
    console.log('Navigation Timing:', metrics.navigationTiming);
    console.log('Resource Timing:', metrics.resourceTiming);
    if (metrics.memoryUsage) {
      console.log('Memory Usage:', metrics.memoryUsage);
    }
    console.log('Custom Metrics:', metrics.customMetrics);
    console.groupEnd();
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const metrics = this.getMetrics();

    // Check if load time is acceptable (< 3 seconds)
    if (metrics.navigationTiming.loadComplete > 3000) {
      return false;
    }

    // Check if DOM content loaded is acceptable (< 2 seconds)
    if (metrics.navigationTiming.domContentLoaded > 2000) {
      return false;
    }

    return true;
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const metrics = this.getMetrics();
    let score = 100;

    // Deduct points for slow load time
    if (metrics.navigationTiming.loadComplete > 3000) {
      score -= Math.min(30, (metrics.navigationTiming.loadComplete - 3000) / 100);
    }

    // Deduct points for slow DOM content loaded
    if (metrics.navigationTiming.domContentLoaded > 2000) {
      score -= Math.min(20, (metrics.navigationTiming.domContentLoaded - 2000) / 100);
    }

    // Deduct points for large resources
    if (metrics.resourceTiming.averageSize > 100000) {
      score -= Math.min(20, (metrics.resourceTiming.averageSize - 100000) / 10000);
    }

    return Math.max(0, Math.round(score));
  }
}

export const performanceOptimizer = new PerformanceOptimizer();

// Initialize on module load
if (typeof window !== 'undefined') {
  performanceOptimizer.init();
}
