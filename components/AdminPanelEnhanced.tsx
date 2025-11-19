import React, { useState } from 'react';
import '../styles/animations.css';

interface AdminPanelEnhancedProps {
  sourceUrls: string;
  onSourceUrlsChange: (urls: string) => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}

/**
 * Enhanced admin panel with WoW theming
 * Features:
 * - Expandable/collapsible design
 * - URL validation feedback
 * - Admin-specific styling
 * - Smooth animations
 */
export const AdminPanelEnhanced: React.FC<AdminPanelEnhancedProps> = ({
  sourceUrls,
  onSourceUrlsChange,
  onRegenerate,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [urlCount, setUrlCount] = useState(0);

  const handleUrlChange = (value: string) => {
    onSourceUrlsChange(value);
    const count = value.split('\n').filter(url => url.trim().length > 0).length;
    setUrlCount(count);
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-2 border-yellow-500/40 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-yellow-900/30 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-600/30 rounded-lg border border-yellow-500/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-yellow-400"
            >
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-2">
              Admin Mode
              <span className="text-xs bg-yellow-600/50 text-yellow-100 px-2 py-0.5 rounded border border-yellow-500/30">
                Configuration
              </span>
            </h3>
            {urlCount > 0 && (
              <p className="text-xs text-yellow-300 mt-1">
                {urlCount} URL{urlCount !== 1 ? 's' : ''} configured
              </p>
            )}
          </div>
        </div>
        <button className="text-yellow-400 focus:outline-none transition-transform duration-300" style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-yellow-500/20 animate-fade-in">
          <div className="mt-3 p-4 bg-gray-900/50 rounded border border-yellow-500/10">
            <label className="block text-sm font-bold text-yellow-200 mb-2">
              Source Injection
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Enter URLs (one per line) to override default AI knowledge with specific guides.
            </p>

            {/* URL Input */}
            <textarea
              value={sourceUrls}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.wowhead.com/guide/class/spec/..."
              className="w-full h-24 p-3 bg-gray-800/80 border-2 border-gray-600 rounded text-sm text-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition font-mono smooth-transition-fast"
            />

            {/* URL Count Indicator */}
            {urlCount > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${Math.min((urlCount / 10) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-yellow-300 font-bold">
                  {urlCount}/10
                </span>
              </div>
            )}

            {/* Regenerate Button */}
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-sm font-bold rounded hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 flex items-center shadow-md ml-auto disabled:opacity-50 disabled:cursor-not-allowed lift-on-hover"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 mr-2 ${isLoading ? 'spin' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 17H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {isLoading ? 'Regenerating...' : 'Regenerate Content'}
            </button>

            {/* Info Box */}
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-200">
              <p className="font-bold mb-1">💡 How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-300">
                <li>Add URLs to override default AI knowledge</li>
                <li>Maximum 10 URLs allowed</li>
                <li>Click "Regenerate Content" to apply changes</li>
                <li>Custom sources take priority over base knowledge</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdminPanelEnhanced);
