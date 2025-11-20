/**
 * Advanced Search Service
 * Full-text search with fuzzy matching and faceted search
 */

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'class' | 'spec' | 'dungeon' | 'item';
  relevance: number;
  tags: string[];
  url?: string;
}

export interface SearchQuery {
  text: string;
  filters?: {
    type?: SearchResult['type'][];
    tags?: string[];
    difficulty?: string[];
  };
  limit?: number;
  offset?: number;
}

export interface SearchStats {
  totalResults: number;
  searchTime: number;
  queriesPerformed: number;
  popularSearches: string[];
}

class AdvancedSearchService {
  private readonly SEARCH_HISTORY_KEY = 'wow_class_helper_search_history';
  private searchHistory: string[] = [];
  private searchIndex: Map<string, SearchResult[]> = new Map();

  constructor() {
    this.loadSearchHistory();
    this.buildSearchIndex();
  }

  /**
   * Perform search
   */
  search(query: SearchQuery): SearchResult[] {
    const startTime = performance.now();

    // Add to history
    this.addToHistory(query.text);

    // Tokenize query
    const tokens = this.tokenize(query.text);

    // Search
    let results: SearchResult[] = [];

    for (const token of tokens) {
      const fuzzyResults = this.fuzzySearch(token);
      results = [...results, ...fuzzyResults];
    }

    // Remove duplicates
    results = Array.from(new Map(results.map((r) => [r.id, r])).values());

    // Apply filters
    if (query.filters) {
      results = this.applyFilters(results, query.filters);
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Apply pagination
    if (query.limit) {
      results = results.slice(query.offset || 0, (query.offset || 0) + query.limit);
    }

    // Track search time
    const searchTime = performance.now() - startTime;
    console.log(`Search completed in ${searchTime.toFixed(2)}ms`);

    return results;
  }

  /**
   * Fuzzy search
   */
  private fuzzySearch(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search in index
    for (const [key, items] of this.searchIndex) {
      if (this.fuzzyMatch(lowerQuery, key)) {
        results.push(...items);
      }
    }

    return results;
  }

  /**
   * Fuzzy match algorithm
   */
  private fuzzyMatch(query: string, target: string): boolean {
    const lowerTarget = target.toLowerCase();

    if (lowerTarget.includes(query)) {
      return true;
    }

    let queryIndex = 0;
    for (let i = 0; i < lowerTarget.length && queryIndex < query.length; i++) {
      if (lowerTarget[i] === query[queryIndex]) {
        queryIndex++;
      }
    }

    return queryIndex === query.length;
  }

  /**
   * Apply filters
   */
  private applyFilters(
    results: SearchResult[],
    filters: SearchQuery['filters']
  ): SearchResult[] {
    if (!filters) return results;

    return results.filter((result) => {
      if (filters.type && !filters.type.includes(result.type)) {
        return false;
      }

      if (filters.tags && !filters.tags.some((tag) => result.tags.includes(tag))) {
        return false;
      }

      return true;
    });
  }

  /**
   * Tokenize query
   */
  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }

  /**
   * Add to search history
   */
  private addToHistory(query: string): void {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      if (this.searchHistory.length > 50) {
        this.searchHistory.pop();
      }
      this.saveSearchHistory();
    }
  }

  /**
   * Get search history
   */
  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    this.searchHistory = [];
    try {
      localStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch {
      console.error('Failed to clear search history');
    }
  }

  /**
   * Get popular searches
   */
  getPopularSearches(limit = 10): string[] {
    return this.searchHistory.slice(0, limit);
  }

  /**
   * Index a result
   */
  indexResult(result: SearchResult): void {
    const key = result.title.toLowerCase();

    if (!this.searchIndex.has(key)) {
      this.searchIndex.set(key, []);
    }

    const items = this.searchIndex.get(key)!;
    if (!items.find((r) => r.id === result.id)) {
      items.push(result);
    }
  }

  /**
   * Get search suggestions
   */
  getSuggestions(query: string, limit = 5): string[] {
    const lowerQuery = query.toLowerCase();
    const suggestions: string[] = [];

    for (const history of this.searchHistory) {
      if (history.toLowerCase().includes(lowerQuery) && suggestions.length < limit) {
        suggestions.push(history);
      }
    }

    return suggestions;
  }

  /**
   * Get search statistics
   */
  getStats(): SearchStats {
    return {
      totalResults: this.searchIndex.size,
      searchTime: 0,
      queriesPerformed: this.searchHistory.length,
      popularSearches: this.getPopularSearches(5),
    };
  }

  /**
   * Clear search index
   */
  clearSearchIndex(): void {
    this.searchIndex.clear();
  }

  // Private helper methods

  private loadSearchHistory(): void {
    try {
      const data = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (data) {
        this.searchHistory = JSON.parse(data);
      }
    } catch {
      this.searchHistory = [];
    }
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(this.searchHistory));
    } catch {
      console.error('Failed to save search history');
    }
  }

  private buildSearchIndex(): void {
    // This would be populated with actual data
    // For now, it's empty and will be populated as results are indexed
  }
}

export const advancedSearchService = new AdvancedSearchService();
