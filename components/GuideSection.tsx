
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner.tsx';

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

  const processInlineMarkdown = (text: string) => {
    let processed = text
      // Escape basic HTML chars to prevent injection (basic protection)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold: **text**
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    
    // Italic: *text*
    processed = processed.replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>');

    // Tooltips: [Ability]{Description}
    // Matches [text]{text} pattern
    const tooltipRegex = /\[([^\]]+)\]\{([^\}]+)\}/g;
    processed = processed.replace(tooltipRegex, (match, ability, desc) => {
        // Apply formatting to specific keywords inside the tooltip description (Cooldown, ID)
        // This ensures "Cooldown: X sec" and "ID: 12345" stand out.
        // Flexible regex to catch Cooldown and ID even if separated by comma or period
        let formattedDesc = desc
            .replace(/(Cooldown:\s*[^.,}]+)/i, '<span class="text-blue-300 font-semibold block mb-1">$1</span>')
            .replace(/(ID:\s*\d+)/i, '<span class="text-purple-300 font-mono text-xs block mb-2">$1</span>');

        return `<span class="group relative inline-block text-yellow-300 font-medium border-b border-dashed border-yellow-500/60 cursor-help transition-colors hover:text-yellow-200 hover:border-yellow-300">
            ${ability}
            <span class="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900/95 backdrop-blur-sm border border-yellow-500/30 text-gray-200 text-sm rounded-lg shadow-xl z-50 pointer-events-none transform group-hover:translate-y-0 translate-y-1">
                <strong class="block text-yellow-400 mb-2 border-b border-gray-700 pb-1">${ability}</strong>
                ${formattedDesc}
                <svg class="absolute text-gray-900/95 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xml:space="preserve"><polygon class="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </span>
        </span>`;
    });

    return processed;
  };

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code Blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                html += '</code></pre>';
                inCodeBlock = false;
            } else {
                 if (inList) { html += '</ul>'; inList = false; }
                html += '<pre class="bg-black bg-opacity-30 rounded-lg p-4 my-4 overflow-x-auto border-l-4 border-[var(--class-color)]"><code class="text-sm font-mono text-gray-300 whitespace-pre-wrap">';
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            html += line.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '\n';
            continue;
        }
        
        // Lists
        if (line.match(/^(\*|-)\s/)) {
            if (!inList) {
                html += '<ul class="list-none pl-2 my-4 space-y-2 text-gray-300">';
                inList = true;
            }
            // Process inline styles within list items
            const content = processInlineMarkdown(line.substring(2));
            html += `<li class="flex items-start"><span class="mr-3 mt-1.5 text-[var(--class-color)] text-xs">◆</span><span class="leading-relaxed">${content}</span></li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            // Headers
            if (line.startsWith('### ')) {
                const content = processInlineMarkdown(line.substring(4));
                html += `<h3 class="text-xl font-bold mt-8 mb-3 text-[var(--class-color)] tracking-wide">${content}</h3>`;
            } else if (line.startsWith('## ')) {
                const content = processInlineMarkdown(line.substring(3));
                html += `<h2 class="text-2xl font-bold mt-10 mb-4 border-b border-gray-700 pb-2 text-white">${content}</h2>`;
            } else if (line.startsWith('# ')) {
                const content = processInlineMarkdown(line.substring(2));
                html += `<h1 class="text-3xl font-bold mt-8 mb-6 border-b-2 border-[var(--class-color)] pb-2 text-white">${content}</h1>`;
            } else if (line.trim() !== '') {
                // Paragraphs
                const content = processInlineMarkdown(line);
                html += `<p class="my-3 leading-7 text-gray-300/90">${content}</p>`;
            }
        }
    }

    if (inList) html += '</ul>';
    if (inCodeBlock) html += '</code></pre>';

    return { __html: html };
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
