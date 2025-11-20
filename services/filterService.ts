/**
 * Filter Service
 * Advanced filtering and filter presets
 */

export type Role = 'tank' | 'healer' | 'dps' | 'all';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface FilterPreset {
  id: string;
  name: string;
  role: Role;
  difficulty: Difficulty;
  expansion?: string;
  createdAt: Date;
}

export interface ActiveFilters {
  role: Role;
  difficulty: Difficulty;
  expansion?: string;
  searchQuery?: string;
}

class FilterService {
  private presets: Map<string, FilterPreset> = new Map();
  private activeFilters: ActiveFilters = {
    role: 'all',
    difficulty: 'all',
  };
  private listeners: Set<(filters: ActiveFilters) => void> = new Set();

  /**
   * Subscribe to filter changes
   */
  subscribe(listener: (filters: ActiveFilters) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.activeFilters }));
  }

  /**
   * Set active filters
   */
  setFilters(filters: Partial<ActiveFilters>): void {
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.save();
    this.notifyListeners();
  }

  /**
   * Get active filters
   */
  getFilters(): ActiveFilters {
    return { ...this.activeFilters };
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.activeFilters = {
      role: 'all',
      difficulty: 'all',
    };
    this.save();
    this.notifyListeners();
  }

  /**
   * Check if filters are active
   */
  hasActiveFilters(): boolean {
    return (
      this.activeFilters.role !== 'all' ||
      this.activeFilters.difficulty !== 'all' ||
      !!this.activeFilters.expansion ||
      !!this.activeFilters.searchQuery
    );
  }

  /**
   * Create a filter preset
   */
  createPreset(name: string, filters: Omit<FilterPreset, 'id' | 'createdAt'>): string {
    const id = `preset_${Date.now()}`;
    const preset: FilterPreset = {
      ...filters,
      id,
      createdAt: new Date(),
    };

    this.presets.set(id, preset);
    this.savePresets();
    return id;
  }

  /**
   * Get all presets
   */
  getPresets(): FilterPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Apply a preset
   */
  applyPreset(presetId: string): void {
    const preset = this.presets.get(presetId);
    if (preset) {
      this.setFilters({
        role: preset.role,
        difficulty: preset.difficulty,
        expansion: preset.expansion,
      });
    }
  }

  /**
   * Delete a preset
   */
  deletePreset(presetId: string): void {
    this.presets.delete(presetId);
    this.savePresets();
  }

  /**
   * Get filter description
   */
  getFilterDescription(): string {
    const parts: string[] = [];

    if (this.activeFilters.role !== 'all') {
      parts.push(`Role: ${this.activeFilters.role}`);
    }

    if (this.activeFilters.difficulty !== 'all') {
      parts.push(`Difficulty: ${this.activeFilters.difficulty}`);
    }

    if (this.activeFilters.expansion) {
      parts.push(`Expansion: ${this.activeFilters.expansion}`);
    }

    if (this.activeFilters.searchQuery) {
      parts.push(`Search: "${this.activeFilters.searchQuery}"`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'No filters applied';
  }

  /**
   * Save filters to localStorage
   */
  private save(): void {
    try {
      localStorage.setItem('wow_class_helper_filters', JSON.stringify(this.activeFilters));
    } catch (error) {
      console.warn('Failed to save filters:', error);
    }
  }

  /**
   * Save presets to localStorage
   */
  private savePresets(): void {
    try {
      const presetsArray = Array.from(this.presets.entries()).map(([id, preset]) => ({
        ...preset,
        createdAt: preset.createdAt.toISOString(),
      }));
      localStorage.setItem('wow_class_helper_filter_presets', JSON.stringify(presetsArray));
    } catch (error) {
      console.warn('Failed to save filter presets:', error);
    }
  }

  /**
   * Load filters from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_filters');
      if (stored) {
        this.activeFilters = JSON.parse(stored);
      }

      const presetsStored = localStorage.getItem('wow_class_helper_filter_presets');
      if (presetsStored) {
        const presetsArray = JSON.parse(presetsStored);
        presetsArray.forEach((preset: any) => {
          this.presets.set(preset.id, {
            ...preset,
            createdAt: new Date(preset.createdAt),
          });
        });
      }
    } catch (error) {
      console.warn('Failed to load filters:', error);
    }
  }
}

export const filterService = new FilterService();
filterService.load();
