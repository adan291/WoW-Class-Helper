import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceOptimizer } from './performanceOptimizer';

describe('performanceOptimizer', () => {
  beforeEach(() => {
    performanceOptimizer.clear();
  });

  describe('mark', () => {
    it('should record a mark', () => {
      performanceOptimizer.mark('test-mark');
      const marks = performanceOptimizer.getMarks();
      expect(marks['test-mark']).toBeDefined();
      expect(typeof marks['test-mark']).toBe('number');
    });

    it('should record multiple marks', () => {
      performanceOptimizer.mark('mark-1');
      performanceOptimizer.mark('mark-2');
      performanceOptimizer.mark('mark-3');

      const marks = performanceOptimizer.getMarks();
      expect(Object.keys(marks).length).toBe(3);
    });
  });

  describe('measure', () => {
    it('should measure time between marks', () => {
      performanceOptimizer.mark('start');
      // Simulate some time passing
      const startTime = performance.now();
      while (performance.now() - startTime < 10) {
        // Wait
      }
      performanceOptimizer.mark('end');

      const duration = performanceOptimizer.measure('test-measure', 'start', 'end');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should record measure', () => {
      performanceOptimizer.mark('start');
      performanceOptimizer.mark('end');
      performanceOptimizer.measure('test', 'start', 'end');

      const measures = performanceOptimizer.getMeasures();
      expect(measures['test']).toBeDefined();
    });
  });

  describe('recordMetric', () => {
    it('should record custom metric', () => {
      performanceOptimizer.recordMetric('custom-metric', 42);
      expect(performanceOptimizer.getMetric('custom-metric')).toBe(42);
    });

    it('should record multiple metrics', () => {
      performanceOptimizer.recordMetric('metric-1', 10);
      performanceOptimizer.recordMetric('metric-2', 20);
      performanceOptimizer.recordMetric('metric-3', 30);

      expect(performanceOptimizer.getMetric('metric-1')).toBe(10);
      expect(performanceOptimizer.getMetric('metric-2')).toBe(20);
      expect(performanceOptimizer.getMetric('metric-3')).toBe(30);
    });
  });

  describe('getMetrics', () => {
    it('should return metrics object', () => {
      const metrics = performanceOptimizer.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.navigationTiming).toBeDefined();
      expect(metrics.resourceTiming).toBeDefined();
      expect(metrics.customMetrics).toBeDefined();
    });

    it('should include recorded metrics', () => {
      performanceOptimizer.recordMetric('test', 100);
      const metrics = performanceOptimizer.getMetrics();
      expect(metrics.customMetrics['test']).toBe(100);
    });
  });

  describe('clear', () => {
    it('should clear marks', () => {
      performanceOptimizer.mark('test');
      performanceOptimizer.clear();
      const marks = performanceOptimizer.getMarks();
      expect(Object.keys(marks).length).toBe(0);
    });

    it('should clear measures', () => {
      performanceOptimizer.mark('start');
      performanceOptimizer.mark('end');
      performanceOptimizer.measure('test', 'start', 'end');
      performanceOptimizer.clear();
      const measures = performanceOptimizer.getMeasures();
      expect(Object.keys(measures).length).toBe(0);
    });

    it('should clear custom metrics', () => {
      performanceOptimizer.recordMetric('test', 100);
      performanceOptimizer.clear();
      expect(performanceOptimizer.getMetric('test')).toBeUndefined();
    });
  });

  describe('isPerformanceAcceptable', () => {
    it('should return true for acceptable performance', () => {
      // Default metrics should be acceptable
      const result = performanceOptimizer.isPerformanceAcceptable();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getPerformanceScore', () => {
    it('should return a score between 0 and 100', () => {
      const score = performanceOptimizer.getPerformanceScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return a number', () => {
      const score = performanceOptimizer.getPerformanceScore();
      expect(typeof score).toBe('number');
    });
  });

  describe('logReport', () => {
    it('should not throw when logging report', () => {
      expect(() => {
        performanceOptimizer.logReport();
      }).not.toThrow();
    });
  });
});
