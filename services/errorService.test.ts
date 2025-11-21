import { describe, it, expect, beforeEach } from 'vitest';
import { errorService, AppError } from './errorService';

describe('errorService', () => {
  beforeEach(() => {
    errorService.clearErrorLog();
  });

  describe('AppError', () => {
    it('should create an AppError with code and message', () => {
      const error = new AppError('TEST_ERROR', 'Test message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('AppError');
    });

    it('should include original error', () => {
      const originalError = new Error('Original');
      const error = new AppError('TEST_ERROR', 'Test', undefined, originalError);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('getUserMessage', () => {
    it('should return user-friendly message for AppError', () => {
      const error = new AppError('INVALID_CLASS', 'Invalid class');
      const message = errorService.getUserMessage(error);
      expect(message).toBe('Invalid class selected. Please choose a valid class.');
    });

    it('should handle API key errors', () => {
      const error = new Error('API key not found');
      const message = errorService.getUserMessage(error);
      expect(message).toBe('API configuration error. Please contact support.');
    });

    it('should handle timeout errors', () => {
      const error = new Error('Request timeout');
      const message = errorService.getUserMessage(error);
      expect(message).toBe('Request timed out. Please try again.');
    });

    it('should handle network errors', () => {
      const error = new Error('Network error occurred');
      const message = errorService.getUserMessage(error);
      expect(message).toBe('Network error. Please check your connection.');
    });

    it('should handle 503 errors', () => {
      const error = new Error('503 Service Unavailable');
      const message = errorService.getUserMessage(error);
      expect(message).toBe('Service temporarily unavailable. Please try again later.');
    });

    it('should handle rate limit errors', () => {
      const error = new Error('429 Too Many Requests');
      const message = errorService.getUserMessage(error);
      expect(message).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('should return default message for unknown errors', () => {
      const error = new Error('Unknown error');
      const message = errorService.getUserMessage(error);
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('createError', () => {
    it('should create an AppError', () => {
      const error = errorService.createError('TEST', 'Test message', 400);
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('TEST');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('handleApiError', () => {
    it('should handle AppError', () => {
      const appError = new AppError('API_ERROR', 'API failed');
      const result = errorService.handleApiError(appError);
      expect(result).toBe(appError);
    });

    it('should convert Error to AppError', () => {
      const error = new Error('API timeout');
      const result = errorService.handleApiError(error);
      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe('API_TIMEOUT');
    });

    it('should handle network errors', () => {
      const error = new Error('Network error');
      const result = errorService.handleApiError(error);
      expect(result.code).toBe('NETWORK_ERROR');
    });

    it('should handle rate limit errors', () => {
      const error = new Error('429 Rate Limited');
      const result = errorService.handleApiError(error);
      expect(result.code).toBe('RATE_LIMITED');
    });

    it('should handle unknown errors', () => {
      const result = errorService.handleApiError('unknown');
      expect(result.code).toBe('UNKNOWN');
    });
  });

  describe('handleValidationError', () => {
    it('should create validation error from error list', () => {
      const errors = ['Error 1', 'Error 2'];
      const result = errorService.handleValidationError(errors);
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('Error 1; Error 2');
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      errorService.logError(error, { component: 'TestComponent', action: 'test' });
      
      const log = errorService.getErrorLog();
      expect(log).toHaveLength(1);
      expect(log[0].error).toBe(error);
      expect(log[0].context.component).toBe('TestComponent');
    });

    it('should maintain max log size', () => {
      for (let i = 0; i < 150; i++) {
        errorService.logError(new Error(`Error ${i}`));
      }
      
      const log = errorService.getErrorLog();
      expect(log.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', () => {
      errorService.logError(new AppError('ERROR_1', 'Error 1'), { severity: 'error' });
      errorService.logError(new AppError('ERROR_1', 'Error 1'), { severity: 'error' });
      errorService.logError(new AppError('ERROR_2', 'Error 2'), { severity: 'warning' });
      
      const stats = errorService.getErrorStats();
      expect(stats.total).toBe(3);
      expect(stats.byCode['ERROR_1']).toBe(2);
      expect(stats.byCode['ERROR_2']).toBe(1);
      expect(stats.bySeverity['error']).toBe(2);
      expect(stats.bySeverity['warning']).toBe(1);
    });
  });

  describe('isRetryable', () => {
    it('should identify retryable errors', () => {
      expect(errorService.isRetryable(new Error('timeout'))).toBe(true);
      expect(errorService.isRetryable(new Error('network error'))).toBe(true);
      expect(errorService.isRetryable(new Error('503 unavailable'))).toBe(true);
      expect(errorService.isRetryable(new Error('429 rate limit'))).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      expect(errorService.isRetryable(new Error('invalid input'))).toBe(false);
      expect(errorService.isRetryable(new Error('not found'))).toBe(false);
    });

    it('should identify retryable AppErrors', () => {
      const error = new AppError('API_TIMEOUT', 'Timeout');
      expect(errorService.isRetryable(error)).toBe(true);
    });
  });

  describe('clearErrorLog', () => {
    it('should clear error log', () => {
      errorService.logError(new Error('Test'));
      expect(errorService.getErrorLog()).toHaveLength(1);
      
      errorService.clearErrorLog();
      expect(errorService.getErrorLog()).toHaveLength(0);
    });
  });
});
