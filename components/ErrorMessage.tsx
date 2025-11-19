import React from 'react';
import type { UserRole } from '../types.ts';

interface ErrorMessageProps {
  error: string;
  context?: string;
  onRetry?: () => void;
  userRole?: UserRole;
  showDetails?: boolean;
  errorType?: 'api' | 'validation' | 'network' | 'unknown';
}

/**
 * Get user-friendly error message based on error type
 */
const getErrorSuggestion = (error: string, _errorType?: string, isAdmin?: boolean): string => {
  if (error.includes('API') || error.includes('api')) {
    return 'Please check your API key configuration and try again.';
  }
  if (error.includes('network') || error.includes('fetch') || error.includes('timeout')) {
    return 'Please check your internet connection and try again.';
  }
  if (error.includes('Invalid') || error.includes('invalid')) {
    return 'Please verify your selections and try again.';
  }
  if (isAdmin && error.includes('URL')) {
    return 'Please verify your custom source URLs are correct and accessible.';
  }
  return 'Please try again or contact support if the problem persists.';
};

/**
 * Get error icon based on error type
 */
const getErrorIcon = (errorType?: string) => {
  switch (errorType) {
    case 'network':
      return (
        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      );
    case 'validation':
      return (
        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'api':
      return (
        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.523a6 6 0 008.367 8.367z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
  }
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  context,
  onRetry,
  userRole = 'user',
  showDetails = false,
  errorType = 'unknown',
}) => {
  const isAdmin = userRole === 'admin' || userRole === 'master';
  const suggestion = getErrorSuggestion(error, errorType, isAdmin);

  return (
    <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getErrorIcon(errorType)}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-300 mb-1">
            {context || 'An error occurred'}
          </h3>
          <p className="text-sm text-red-200 mb-2">{error}</p>
          
          <p className="text-xs text-red-300 mb-3 italic">
            💡 {suggestion}
          </p>

          {isAdmin && (
            <p className="text-xs text-yellow-300 mb-3 bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
              🔧 Admin tip: If using custom source URLs, verify they are accessible and contain relevant content.
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors duration-200 active:scale-95"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            )}
            {showDetails && (
              <details className="text-xs text-red-300">
                <summary className="cursor-pointer hover:text-red-200 px-3 py-1.5 bg-red-900/30 rounded transition-colors">
                  Show details
                </summary>
                <pre className="mt-2 bg-gray-900 p-2 rounded overflow-auto text-xs max-h-48 border border-red-500/30">
                  {error}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
