import React from 'react';
import type { UserRole } from '../types.ts';

interface ErrorMessageProps {
  error: string;
  context?: string;
  onRetry?: () => void;
  userRole?: UserRole;
  showDetails?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  context,
  onRetry,
  userRole = 'user',
  showDetails = false,
}) => {
  const isAdmin = userRole === 'admin' || userRole === 'master';

  return (
    <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-300 mb-1">
            {context || 'An error occurred'}
          </h3>
          <p className="text-sm text-red-200 mb-3">{error}</p>

          {isAdmin && (
            <p className="text-xs text-red-300 mb-3 italic">
              💡 Admin tip: If using custom source URLs, verify they are accessible and contain relevant content.
            </p>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            )}
            {showDetails && (
              <details className="text-xs text-red-300">
                <summary className="cursor-pointer hover:text-red-200">Show details</summary>
                <pre className="mt-2 bg-gray-900 p-2 rounded overflow-auto text-xs">
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
