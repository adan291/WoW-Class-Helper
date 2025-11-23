import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { WOW_CLASSES } from '../constants.ts';
import type { WowClass } from '../types.ts';

interface SearchBarProps {
  onSelectResult: (wowClass: WowClass) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectResult }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return WOW_CLASSES.filter(
      (wowClass) =>
        wowClass.name.toLowerCase().includes(query) ||
        wowClass.specs.some((spec) => spec.name.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      setIsOpen(value.trim().length > 0);
    }, 300);
  }, []);

  // Handle result selection
  const handleSelectResult = useCallback(
    (wowClass: WowClass) => {
      onSelectResult(wowClass);
      setSearchQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onSelectResult]
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || filteredResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelectResult(filteredResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, filteredResults, selectedIndex, handleSelectResult]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-search-container]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div data-search-container className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.trim().length > 0 && setIsOpen(true)}
          placeholder="Search classes, specs, or abilities..."
          aria-label="Search WoW classes"
          role="searchbox"
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-gray-600 bg-gray-800 shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredResults.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {filteredResults.map((wowClass, index) => (
                <li key={wowClass.id}>
                  <button
                    onClick={() => handleSelectResult(wowClass)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-200'
                    }`}
                    role="button"
                    aria-label={`Select ${wowClass.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: wowClass.color }}
                      >
                        {wowClass.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold" style={{ color: wowClass.color }}>
                          {wowClass.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {wowClass.specs.map((s) => s.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-gray-400">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
