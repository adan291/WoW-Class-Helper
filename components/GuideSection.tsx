import React, { useState, useCallback } from 'react';
import { formatContent } from '../services/markdownProcessor.ts';
import '../styles/animations.css';

interface GuideSectionProps {
  content: string;
}

const GuideSection: React.FC<GuideSectionProps> = ({ content }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (content) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy text:', err);
        });
    }
  }, [content]);

  if (!content) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No content available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 z-10 flex items-center px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 text-gray-400 hover:text-white rounded-md text-xs font-medium transition-all duration-200 backdrop-blur-sm active:scale-95"
      >
        {isCopied ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1.5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy
          </>
        )}
      </button>

      {/* Content */}
      <div
        className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-yellow-400 prose-strong:text-white pt-8"
        dangerouslySetInnerHTML={formatContent(content)}
      />
    </div>
  );
};

export default React.memo(GuideSection);
