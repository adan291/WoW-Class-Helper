/**
 * Centralized Error Handling Service
 * Provides consistent error handling, logging, and user-friendly messages
 */

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  severity?: ErrorSeverity;
}

class ErrorService {
  private errorLog: Array<{ error: Error; context: ErrorContext; timestamp: Date }> = [];
  private maxLogSize = 100;

  /**
   * Log an error with context
   */
  logError(error: Error, context: ErrorContext = {}): void {
    const entry = {
      error,
      context: {
        ...context,
        timestamp: context.timestamp || new Date(),
      },
      timestamp: new Date(),
    };

    this.errorLog.push(entry);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context.severity || 'error'}] ${error.message}`, {
        code: error instanceof AppError ? error.code : 'UNKNOWN',
        context,
        originalError: error instanceof AppError ? error.originalError : error,
      });
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: Error): string {
    if (error instanceof AppError) {
      return this.getMessageForCode(error.code);
    }

    const message = error.message.toLowerCase();

    if (message.includes('api key')) {
      return 'API configuration error. Please contact support.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    if (message.includes('503') || message.includes('unavailable')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (message.includes('429') || message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get message for specific error code
   */
  private getMessageForCode(code: string): string {
    const messages: Record<string, string> = {
      INVALID_CLASS: 'Invalid class selected. Please choose a valid class.',
      INVALID_SPEC: 'Invalid specialization. Please choose a valid spec.',
      INVALID_DUNGEON: 'Invalid dungeon selected. Please choose a valid dungeon.',
      INVALID_URL: 'Invalid URL format. Please check your URLs.',
      INVALID_PROMPT: 'Invalid request. Please try again.',
      API_ERROR: 'Failed to generate content. Please try again.',
      API_TIMEOUT: 'Request timed out. Please try again.',
      NETWORK_ERROR: 'Network error. Please check your connection.',
      RATE_LIMITED: 'Too many requests. Please wait a moment.',
      VALIDATION_ERROR: 'Invalid input. Please check your data.',
      CACHE_ERROR: 'Cache error. Please refresh the page.',
      UNKNOWN: 'An unexpected error occurred. Please try again.',
    };

    return messages[code] || messages.UNKNOWN;
  }

  /**
   * Create an AppError
   */
  createError(
    code: string,
    message: string,
    statusCode?: number,
    originalError?: Error
  ): AppError {
    return new AppError(code, message, statusCode, originalError);
  }

  /**
   * Handle API errors
   */
  handleApiError(error: unknown, context: ErrorContext = {}): AppError {
    if (error instanceof AppError) {
      this.logError(error, { ...context, severity: 'error' });
      return error;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      let code = 'API_ERROR';
      let statusCode: number | undefined;

      if (message.includes('timeout')) {
        code = 'API_TIMEOUT';
      } else if (message.includes('network')) {
        code = 'NETWORK_ERROR';
      } else if (message.includes('429')) {
        code = 'RATE_LIMITED';
      } else if (message.includes('503')) {
        code = 'API_ERROR';
      }

      const appError = this.createError(code, error.message, statusCode, error);
      this.logError(appError, { ...context, severity: 'error' });
      return appError;
    }

    const appError = this.createError('UNKNOWN', 'An unknown error occurred');
    this.logError(appError, { ...context, severity: 'error' });
    return appError;
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: string[], context: ErrorContext = {}): AppError {
    const message = errors.join('; ');
    const appError = this.createError('VALIDATION_ERROR', message);
    this.logError(appError, { ...context, severity: 'warning' });
    return appError;
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byCode: {} as Record<string, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recent: this.errorLog.slice(-10),
    };

    this.errorLog.forEach(entry => {
      const code = entry.error instanceof AppError ? entry.error.code : 'UNKNOWN';
      const severity = entry.context.severity || 'error';

      stats.byCode[code] = (stats.byCode[code] || 0) + 1;
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: Error): boolean {
    if (error instanceof AppError) {
      return ['API_TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMITED'].includes(error.code);
    }

    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('temporarily') ||
      message.includes('503') ||
      message.includes('429')
    );
  }
}

export const errorService = new ErrorService();
