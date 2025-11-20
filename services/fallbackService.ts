/**
 * Fallback Service
 * Implements graceful degradation and fallback strategies
 */

export interface FallbackState {
  apiAvailable: boolean;
  cacheAvailable: boolean;
  mockDataAvailable: boolean;
  offlineMode: boolean;
  degradedMode: boolean;
}

class FallbackService {
  private state: FallbackState = {
    apiAvailable: true,
    cacheAvailable: true,
    mockDataAvailable: true,
    offlineMode: false,
    degradedMode: false,
  };

  private listeners: Set<(state: FallbackState) => void> = new Set();

  /**
   * Subscribe to fallback state changes
   */
  subscribe(listener: (state: FallbackState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  /**
   * Set API availability
   */
  setApiAvailable(available: boolean): void {
    this.state.apiAvailable = available;
    this.updateDegradedMode();
    this.notifyListeners();
  }

  /**
   * Set cache availability
   */
  setCacheAvailable(available: boolean): void {
    this.state.cacheAvailable = available;
    this.updateDegradedMode();
    this.notifyListeners();
  }

  /**
   * Set mock data availability
   */
  setMockDataAvailable(available: boolean): void {
    this.state.mockDataAvailable = available;
    this.updateDegradedMode();
    this.notifyListeners();
  }

  /**
   * Set offline mode
   */
  setOfflineMode(offline: boolean): void {
    this.state.offlineMode = offline;
    if (offline) {
      this.state.apiAvailable = false;
    }
    this.updateDegradedMode();
    this.notifyListeners();
  }

  /**
   * Update degraded mode based on current state
   */
  private updateDegradedMode(): void {
    // Degraded mode when:
    // - API unavailable AND cache unavailable
    // - OR offline AND no cache
    // - OR offline AND no mock data
    this.state.degradedMode =
      (!this.state.apiAvailable && !this.state.cacheAvailable) ||
      (this.state.offlineMode && !this.state.cacheAvailable) ||
      (this.state.offlineMode && !this.state.mockDataAvailable);
  }

  /**
   * Get current fallback state
   */
  getState(): FallbackState {
    return { ...this.state };
  }

  /**
   * Get fallback strategy based on current state
   */
  getFallbackStrategy(): 'api' | 'cache' | 'mock' | 'degraded' {
    if (this.state.apiAvailable) {
      return 'api';
    }
    if (this.state.cacheAvailable) {
      return 'cache';
    }
    if (this.state.mockDataAvailable) {
      return 'mock';
    }
    return 'degraded';
  }

  /**
   * Check if any content source is available
   */
  hasAvailableSource(): boolean {
    return this.state.apiAvailable || this.state.cacheAvailable || this.state.mockDataAvailable;
  }

  /**
   * Get user-friendly status message
   */
  getStatusMessage(): string {
    if (this.state.apiAvailable) {
      return 'Connected to AI';
    }
    if (this.state.cacheAvailable) {
      return 'Using cached content';
    }
    if (this.state.mockDataAvailable) {
      return 'Using demo content';
    }
    return 'Limited functionality';
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.state = {
      apiAvailable: true,
      cacheAvailable: true,
      mockDataAvailable: true,
      offlineMode: false,
      degradedMode: false,
    };
    this.notifyListeners();
  }
}

// Create singleton instance
export const fallbackService = new FallbackService();
