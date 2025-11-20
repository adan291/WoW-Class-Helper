/**
 * Search Bar Component
 * Global search with history and filters
 */

import React, { useState, useEffect } from 'react';
import { searchService, type SearchResult } from '../services/searchService.ts';
import { toastService } from '../services/toastService.ts';

interface SearchBarProps {
  onSelectResult?: (result: SearchResult) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setHistory(searchService.getHistory());
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const searchResults = searchService.search(value);
      setResults(searchResults);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    searchService.addToHistory(query);
    setHistory(searchService.getHistory());
    setShowResults(false);
    setQuery('');
    onSelectResult?.(result);
    toastService.success(`Selected: ${result.name}`);
  };

  const handleClearHistory = () => {
    searchService.clearHistory();
    setHistory([]);
    toastService.info('Search history cleared');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder="🔍 Search classes, specs, dungeons..."
          className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {results.map((result) => (
                <button
                  key={`${result.type}_${result.id}`}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 transition flex items-center gap-3"
                >
                  <span className="text-lg">
                    {result.type === 'class' && '⚔️'}
                    {result.type === 'spec' && '🎯'}
                    {result.type === 'dungeon' && '🏰'}
                    {result.type === 'expansion' && '🌍'}
                  </span>
                  <div>
                    <p className="text-gray-200 font-medium">{result.name}</p>
                    <p className="text-xs text-gray-400">{result.description}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4">
              {history.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-bold">Recent Searches</p>
                  <div className="space-y-1">
                    {history.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSearch(item)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition"
                      >
                        🕐 {item}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="w-full mt-2 text-xs text-gray-400 hover:text-gray-200 py-1"
                  >
                    Clear history
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
