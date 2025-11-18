

import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';

interface GuideSectionProps {
  title: string;
  isLoading: boolean;
  content: string;
  error: string | null;
}

const GuideSection = ({ isLoading, content, error }: GuideSectionProps) => {
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

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('```')) {
            if (inCodeBlock) {
                html += '</code></pre>';
                inCodeBlock = false;
            } else {
                 if (inList) { html += '</ul>'; inList = false; }
                html += '<pre class="bg-black bg-opacity-30 rounded-lg p-4 my-4 overflow-x-auto border-l-4" style="border-color: var(--class-color);"><code class="text-sm font-mono text-gray-300 whitespace-pre-wrap">';
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            html += line.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '\n';
            continue;
        }
        
        if (line.match(/^(\*|-)\s/)) {
            if (!inList) {
                html += '<ul class="list-none pl-2 my-4 space-y-2 text-gray-300">';
                inList = true;
            }
            html += `<li class="flex items-start"><span class="mr-3 mt-1" style="color: var(--class-color);">◆</span><span>${line.substring(2)}</span></li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            if (line.startsWith('### ')) {
                html += `<h3 class="text-xl font-bold mt-6 mb-2" style="color: var(--class-color);">${line.substring(4)}</h3>`;
            } else if (line.startsWith('## ')) {
                html += `<h2 class="text-2xl font-bold mt-8 mb-3 border-b-2 pb-2 text-white" style="border-color: var(--class-color);">${line.substring(3)}</h2>`;
            } else if (line.startsWith('# ')) {
                html += `<h1 class="text-3xl font-bold mt-8 mb-4 border-b-2 pb-2 text-white" style="border-color: var(--class-color);">${line.substring(2)}</h1>`;
            } else if (line.trim().startsWith('**') && line.trim().endsWith('**') && line.trim().length > 4) {
                 const boldContent = line.trim().substring(2, line.trim().length - 2);
                 html += `<p class="my-2"><strong class="font-semibold text-white">${boldContent}</strong></p>`;
            } else if (line.trim() !== '') {
                html += `<p class="my-2 leading-relaxed text-gray-300">${line}</p>`;
            }
        }
    }

    if (inList) html += '</ul>';
    if (inCodeBlock) html += '</code></pre>';

    return { __html: html };
  };

  return (
    <div className="relative p-4 md:p-6 min-h-[400px]">
       {!isLoading && !error && content && (
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex items-center px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-md text-xs font-semibold hover:bg-gray-600/70 hover:text-white transition-all duration-200"
        >
          {isCopied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy
            </>
          )}
        </button>
      )}
      {isLoading && (
        <div className="flex justify-center items-center h-full pt-16">
          <LoadingSpinner />
        </div>
      )}
      {error && (
        <div className="flex flex-col justify-center items-center h-full text-red-400 pt-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold">Error loading guide</p>
          <p className="text-sm max-w-md">{error}</p>
        </div>
      )}
      {!isLoading && !error && (
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={formatContent(content)} />
      )}
    </div>
  );
};

export default GuideSection;