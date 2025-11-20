/**
 * Preferences Service
 * Manages user preferences and settings
 */

export type Theme = 'dark' | 'light' | 'auto';
export type ContentDensity = 'compact' | 'normal' | 'comfortable';

export interface UserPreferences {
  theme: Theme;
  fontSize: number; // 12-20px
  contentDensity: ContentDensity;
  favoriteClass?: string;
  favoriteSpec?: string;
  favoriteExpansion?: string;
  autoSaveBookmarks: boolean;
  showNotifications: boolean;
  enableAnimations: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  fontSize: 16,
  contentDensity: 'normal',
  autoSaveBookmarks: true,
  showNotifications: true,
  enableAnimations: true,
};

class PreferencesService {
  private preferences: UserPreferences = { ...DEFAULT_PREFERENCES };
  private listeners: Set<(prefs: UserPreferences) => void> = new Set();

  /**
   * Subscribe to preference changes
   */
  subscribe(listener: (prefs: UserPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.preferences }));
  }

  /**
   * Get all preferences
   */
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences
   */
  updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.save();
    this.notifyListeners();
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    this.preferences.theme = theme;
    this.applyTheme(theme);
    this.save();
    this.notifyListeners();
  }

  /**
   * Set font size
   */
  setFontSize(size: number): void {
    const clampedSize = Math.max(12, Math.min(20, size));
    this.preferences.fontSize = clampedSize;
    this.applyFontSize(clampedSize);
    this.save();
    this.notifyListeners();
  }

  /**
   * Set content density
   */
  setContentDensity(density: ContentDensity): void {
    this.preferences.contentDensity = density;
    this.applyContentDensity(density);
    this.save();
    this.notifyListeners();
  }

  /**
   * Set favorite class
   */
  setFavoriteClass(classId: string): void {
    this.preferences.favoriteClass = classId;
    this.save();
    this.notifyListeners();
  }

  /**
   * Set favorite spec
   */
  setFavoriteSpec(specId: string): void {
    this.preferences.favoriteSpec = specId;
    this.save();
    this.notifyListeners();
  }

  /**
   * Set favorite expansion
   */
  setFavoriteExpansion(expansionId: string): void {
    this.preferences.favoriteExpansion = expansionId;
    this.save();
    this.notifyListeners();
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light-theme');
    } else {
      html.classList.remove('light-theme');
    }
  }

  /**
   * Apply font size to DOM
   */
  private applyFontSize(size: number): void {
    document.documentElement.style.fontSize = `${size}px`;
  }

  /**
   * Apply content density to DOM
   */
  private applyContentDensity(density: ContentDensity): void {
    const html = document.documentElement;
    html.classList.remove('density-compact', 'density-normal', 'density-comfortable');
    html.classList.add(`density-${density}`);
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.applyTheme(this.preferences.theme);
    this.applyFontSize(this.preferences.fontSize);
    this.applyContentDensity(this.preferences.contentDensity);
    this.save();
    this.notifyListeners();
  }

  /**
   * Save to localStorage
   */
  private save(): void {
    try {
      localStorage.setItem('wow_class_helper_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save preferences:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load(): void {
    try {
      const stored = localStorage.getItem('wow_class_helper_preferences');
      if (stored) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        this.applyTheme(this.preferences.theme);
        this.applyFontSize(this.preferences.fontSize);
        this.applyContentDensity(this.preferences.contentDensity);
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  }
}

export const preferencesService = new PreferencesService();
preferencesService.load();
