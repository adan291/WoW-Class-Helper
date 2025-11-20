/**
 * Theme Service
 * Manages dark mode and theme customization
 */

export type Theme = 'dark' | 'light' | 'auto';
export type DarkTheme = 'default' | 'eye-care' | 'high-contrast' | 'custom';

export interface ThemeConfig {
  theme: Theme;
  darkTheme: DarkTheme;
  customColors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  autoSchedule?: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
}

export interface ThemePreset {
  id: DarkTheme;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
}

class ThemeService {
  private readonly THEME_KEY = 'wow_class_helper_theme';
  private currentTheme: Theme = 'auto';
  private currentDarkTheme: DarkTheme = 'default';

  private readonly PRESETS: Record<DarkTheme, ThemePreset> = {
    default: {
      id: 'default',
      name: 'Default Dark',
      description: 'Standard dark theme',
      colors: {
        primary: '#3B82F6',
        secondary: '#A855F7',
        background: '#111827',
        surface: '#1F2937',
        text: '#F3F4F6',
        textSecondary: '#D1D5DB',
      },
    },
    'eye-care': {
      id: 'eye-care',
      name: 'Eye Care',
      description: 'Reduced brightness for eye comfort',
      colors: {
        primary: '#60A5FA',
        secondary: '#C084FC',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#E2E8F0',
        textSecondary: '#CBD5E1',
      },
    },
    'high-contrast': {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Maximum contrast for accessibility',
      colors: {
        primary: '#0EA5E9',
        secondary: '#D946EF',
        background: '#000000',
        surface: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#E5E5E5',
      },
    },
    custom: {
      id: 'custom',
      name: 'Custom',
      description: 'User-defined theme',
      colors: {
        primary: '#3B82F6',
        secondary: '#A855F7',
        background: '#111827',
        surface: '#1F2937',
        text: '#F3F4F6',
        textSecondary: '#D1D5DB',
      },
    },
  };

  constructor() {
    this.loadTheme();
    this.applyTheme();
    this.setupAutoSchedule();
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Get current dark theme
   */
  getCurrentDarkTheme(): DarkTheme {
    return this.currentDarkTheme;
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyTheme();
    this.saveTheme();
  }

  /**
   * Set dark theme preset
   */
  setDarkTheme(darkTheme: DarkTheme): void {
    this.currentDarkTheme = darkTheme;
    this.applyTheme();
    this.saveTheme();
  }

  /**
   * Get theme presets
   */
  getPresets(): ThemePreset[] {
    return Object.values(this.PRESETS);
  }

  /**
   * Get preset by ID
   */
  getPreset(id: DarkTheme): ThemePreset | null {
    return this.PRESETS[id] || null;
  }

  /**
   * Apply custom colors
   */
  applyCustomColors(colors: Partial<ThemePreset['colors']>): void {
    const preset = this.PRESETS.custom;
    preset.colors = { ...preset.colors, ...colors };
    this.currentDarkTheme = 'custom';
    this.applyTheme();
    this.saveTheme();
  }

  /**
   * Reset to default theme
   */
  resetToDefault(): void {
    this.currentTheme = 'auto';
    this.currentDarkTheme = 'default';
    this.applyTheme();
    this.saveTheme();
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    if (this.currentTheme === 'dark') return true;
    if (this.currentTheme === 'light') return false;

    // Auto mode - check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Get effective colors
   */
  getColors(): ThemePreset['colors'] {
    const preset = this.PRESETS[this.currentDarkTheme];
    return preset.colors;
  }

  /**
   * Get CSS variables
   */
  getCSSVariables(): Record<string, string> {
    const colors = this.getColors();
    return {
      '--color-primary': colors.primary,
      '--color-secondary': colors.secondary,
      '--color-background': colors.background,
      '--color-surface': colors.surface,
      '--color-text': colors.text,
      '--color-text-secondary': colors.textSecondary,
    };
  }

  /**
   * Export theme config
   */
  exportTheme(): string {
    const config: ThemeConfig = {
      theme: this.currentTheme,
      darkTheme: this.currentDarkTheme,
    };
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import theme config
   */
  importTheme(json: string): boolean {
    try {
      const config: ThemeConfig = JSON.parse(json);
      if (config.theme && config.darkTheme) {
        this.currentTheme = config.theme;
        this.currentDarkTheme = config.darkTheme;
        this.applyTheme();
        this.saveTheme();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private loadTheme(): void {
    try {
      const saved = localStorage.getItem(this.THEME_KEY);
      if (saved) {
        const config: ThemeConfig = JSON.parse(saved);
        this.currentTheme = config.theme || 'auto';
        this.currentDarkTheme = config.darkTheme || 'default';
      }
    } catch {
      this.currentTheme = 'auto';
      this.currentDarkTheme = 'default';
    }
  }

  private saveTheme(): void {
    try {
      const config: ThemeConfig = {
        theme: this.currentTheme,
        darkTheme: this.currentDarkTheme,
      };
      localStorage.setItem(this.THEME_KEY, JSON.stringify(config));
    } catch {
      console.error('Failed to save theme');
    }
  }

  private applyTheme(): void {
    const isDark = this.isDarkMode();
    const colors = this.getColors();

    // Apply to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply CSS variables
    Object.entries(this.getCSSVariables()).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }

  private setupAutoSchedule(): void {
    if (this.currentTheme !== 'auto') return;

    // Check system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      this.applyTheme();
    });
  }
}

export const themeService = new ThemeService();
