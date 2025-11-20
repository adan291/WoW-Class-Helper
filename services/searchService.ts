/**
 * Search Service
 * Handles global search and filtering functionality
 */

import { WOW_CLASSES, DUNGEONS, EXPANSIONS } from '../constants.ts';
import type { WowClass, Specialization, Dungeon } from '../types.ts';

export interface SearchResult {
  type: 'class' | 'spec' | 'dungeon' | 'expansion';
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface SearchFilters {
  expansion?: string;
  role?: string;
  difficulty?: string;
  query?: string;
}

class SearchService {
  private searchHistory: string[] = [];
  private maxHistoryItems = 10;

  /**
   * Search across all content
   */
  search(query: string, filters?: SearchFilters): SearchResult[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search classes
    WOW_CLASSES.forEach(wowClass => {
      if (wowClass.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'class',
          id: wowClass.id,
          name: wowClass.name,
          description: `${wowClass.name} class`,
        });
      }

      // Search specs
      if (wowClass.specs) {
        wowClass.specs.forEach(spec => {
          if (spec.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              type: 'spec',
              id: `${wowClass.id}_${spec.id}`,
              name: `${spec.name} (${wowClass.name})`,
              description: `${spec.name} specialization`,
            });
          }
        });
      }
    });

    // Search dungeons
    DUNGEONS.forEach(dungeon => {
      if (dungeon.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'dungeon',
          id: dungeon.name,
          name: dungeon.name,
          description: `${dungeon.name} dungeon`,
        });
      }
    });

    // Search expansions
    EXPANSIONS.forEach(expansion => {
      if (expansion.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'expansion',
          id: expansion.id,
          name: expansion.name,
          description: `${expansion.name} expansion`,
        });
      }
    });

    // Apply filters
    return this.applyFilters(results, filters);
  }

  /**
   * Apply filters to search results
   */
  private applyFilters(results: SearchResult[], filters?: SearchFilters): SearchResult[] {
    if (!filters) return results;

    return results.filter(result => {
      if (filters.expansion && result.type !== 'expansion') {
        // Could add expansion filtering logic here
      }
      return true;
    });
  }

  /**
   * Add to search history
   */
  addToHistory(query: string): void {
    if (!query.trim()) return;

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => item !== query);

    // Add to beginning
    this.searchHistory.unshift(query);

    // Keep only max items
    this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);

    this.saveHistory();
  }

  /**
   * Get search history
   */
  getHistory(): string[] {
    return [...this.searchHistory];
  }

  /**
   * Clear search history
   */
  clearHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem('wow_class_helper_search_history');
  }

  /**
   * Save history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem('wow_class_helper_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  /**
   * Load history from localStorage
   */
  loadHistory(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_search_history');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }
}

export const searchService = new SearchService();
searchService.loadHistory();
