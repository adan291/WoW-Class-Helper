
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';
import { formatContent } from '../services/markdownProcessor.ts';

interface GuideSectionProps {
  title: string;
  icon?: React.ReactNode;
  isLoading: boolean;
  content: string;
  error: string | null;
}

const GuideSection = ({ title, icon, isLoading, content, error }: GuideSectionProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };



  return (
    <div className="relative p-6 md:p-8 min-h-[400px]">
       {!isLoading && !error && content && (
        <button
          onClick={handleCopy}
          className="absolute top-6 right-6 z-10 flex items-center px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 text-gray-400 hover:text-white rounded-md text-xs font-medium transition-all duration-200 backdrop-blur-sm"
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
      )}

      {!isLoading && !error && content && (
          <div className="mb-8 border-b border-gray-700 pb-5 flex items-center">
            {icon && (
                <div className="mr-4 p-2 bg-gray-800 rounded-lg border border-gray-700 shadow-inner">
                    {icon}
                </div>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
          </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-full pt-20 pb-20">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="flex flex-col justify-center items-center h-full text-red-400 pt-20 text-center px-4">
          <div className="bg-red-900/20 p-4 rounded-full mb-4 border border-red-900/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold mb-2">Unable to Load Guide</p>
          <p className="text-sm text-gray-400 max-w-md leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition-colors"
          >
            Reload Page
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-[var(--class-color)] prose-strong:text-white" dangerouslySetInnerHTML={formatContent(content)} />
      )}
    </div>
  );
};

export default GuideSection;
