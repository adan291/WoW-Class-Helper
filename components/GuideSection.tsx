
import React, { useState, useCallback } from 'react';

import { ContentFrameEnhanced } from './ContentFrameEnhanced.tsx';
import { LoadingStateEnhanced } from './LoadingStateEnhanced.tsx';
import { ErrorStateEnhanced } from './ErrorStateEnhanced.tsx';
import { formatContent } from '../services/markdownProcessor.ts';
import '../styles/animations.css';

interface GuideSectionProps {
  title: string;
  icon?: React.ReactNode;
  isLoading: boolean;
  isValidating?: boolean;
  content: string;
  error: string | null;
  validationErrors?: string[];
  dataQuality?: number;
  onRetry?: () => void;
  userRole?: 'user' | 'master' | 'admin';
  retryCount?: number;
  retryTimer?: number;
}

const GuideSection = ({ 
  title, 
  // icon, 
  isLoading,
  isValidating = false,
  content, 
  error,
  validationErrors = [],
  dataQuality = 100,
  onRetry,
  userRole = 'user',
  retryCount = 0,
  retryTimer = 0,
}: GuideSectionProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }, [content]);

  return (
    <ContentFrameEnhanced
      classColor={userRole === 'admin' ? '#FFD700' : 'var(--class-color, #FFD700)'}
      title={!isLoading && !error && content ? title : undefined}
    >
      {!isLoading && !error && content && (
        <>
          {content.includes('[DEMO MODE]') && (
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3 py-1.5 bg-blue-900/50 border border-blue-500 text-blue-300 rounded-md text-xs font-medium backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
              Demo Mode - API Unavailable
              <button
                onClick={onRetry}
                disabled={isLoading}
                className="ml-2 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          <button
            onClick={handleCopy}
            className="absolute top-6 right-6 z-10 flex items-center px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 text-gray-400 hover:text-white rounded-md text-xs font-medium transition-all duration-200 backdrop-blur-sm active:scale-95"
          >
            {isCopied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Copied
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy Text
              </>
            )}
          </button>
        </>
      )}

      {isValidating && (
        <div className="flex items-center gap-2 text-blue-400 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm">Validating data...</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg mb-4">
          <p className="text-red-400 font-semibold mb-2">Data Validation Errors:</p>
          <ul className="text-red-300 text-sm space-y-1">
            {validationErrors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {!isValidating && dataQuality < 90 && dataQuality > 0 && !error && (
        <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm font-semibold">Data Quality:</span>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  dataQuality >= 90
                    ? 'bg-green-500'
                    : dataQuality >= 80
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${dataQuality}%` }}
              ></div>
            </div>
            <span className="text-yellow-300 text-sm font-semibold">{dataQuality.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {isLoading && (
        <LoadingStateEnhanced
          classColor="var(--class-color, #FFD700)"
          message="Generating guide..."
          retryCount={retryCount}
          retryTimer={retryTimer}
        />
      )}

      {error && (
        <ErrorStateEnhanced
          classColor="#FF6B6B"
          title="Unable to Load Guide"
          message={error}
          onRetry={onRetry}
        />
      )}

      {!isLoading && !error && content && (
        <div className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-[var(--class-color)] prose-strong:text-white" dangerouslySetInnerHTML={formatContent(content)} />
      )}
    </ContentFrameEnhanced>
  );
};

export default React.memo(GuideSection);
