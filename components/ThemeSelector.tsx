/**
 * Theme Selector Component
 * Manage dark mode and theme customization
 */

import React, { useState, useCallback } from 'react';
import { themeService, Theme, DarkTheme } from '../services/themeService';

interface ThemeSelectorProps {
  onThemeChange?: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themeService.getCurrentTheme());
  const [currentDarkTheme, setCurrentDarkTheme] = useState<DarkTheme>(
    themeService.getCurrentDarkTheme()
  );
  const [isOpen, setIsOpen] = useState(false);

  const presets = themeService.getPresets();

  const handleThemeChange = useCallback(
    (theme: Theme) => {
      themeService.setTheme(theme);
      setCurrentTheme(theme);
      setIsOpen(false);
      onThemeChange?.(theme);
    },
    [onThemeChange]
  );

  const handleDarkThemeChange = useCallback((darkTheme: DarkTheme) => {
    themeService.setDarkTheme(darkTheme);
    setCurrentDarkTheme(darkTheme);
  }, []);

  const handleReset = useCallback(() => {
    themeService.resetToDefault();
    setCurrentTheme('auto');
    setCurrentDarkTheme('default');
  }, []);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 hover:border-gray-600 transition"
        title="Change theme"
      >
        <span className="text-lg">🎨</span>
        <span className="text-sm font-semibold capitalize">{currentTheme}</span>
        <span className="text-xs text-gray-400">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 rounded-lg border border-gray-700 shadow-lg z-50">
          {/* Header */}
          <div className="p-3 border-b border-gray-700">
            <p className="text-xs font-semibold text-gray-400">THEME</p>
          </div>

          {/* Theme Options */}
          <div className="divide-y divide-gray-700 p-3 space-y-2">
            {(['auto', 'dark', 'light'] as Theme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                className={`w-full px-3 py-2 text-left text-sm rounded transition ${
                  currentTheme === theme
                    ? 'bg-blue-900 bg-opacity-50 text-blue-300 font-semibold'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{theme} Mode</span>
                  {currentTheme === theme && <span className="text-blue-400">✓</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Dark Theme Presets */}
          {currentTheme !== 'light' && (
            <>
              <div className="border-t border-gray-700 p-3">
                <p className="text-xs font-semibold text-gray-400 mb-2">DARK THEME</p>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleDarkThemeChange(preset.id)}
                      className={`w-full px-3 py-2 text-left text-sm rounded transition ${
                        currentDarkTheme === preset.id
                          ? 'bg-blue-900 bg-opacity-50 text-blue-300 font-semibold'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{preset.name}</p>
                          <p className="text-xs text-gray-500">{preset.description}</p>
                        </div>
                        {currentDarkTheme === preset.id && (
                          <span className="text-blue-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="border-t border-gray-700 p-3 flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * Theme Info Panel Component
 */
export const ThemeInfoPanel: React.FC = () => {
  const currentTheme = themeService.getCurrentTheme();
  const currentDarkTheme = themeService.getCurrentDarkTheme();
  const preset = themeService.getPreset(currentDarkTheme);
  const colors = themeService.getColors();

  if (!preset) return null;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Theme Information</h3>

      {/* Current Theme */}
      <div className="space-y-2">
        <div className="p-3 bg-gray-800 rounded">
          <p className="text-xs text-gray-400">Current Theme</p>
          <p className="text-white font-semibold capitalize">{currentTheme}</p>
        </div>

        <div className="p-3 bg-gray-800 rounded">
          <p className="text-xs text-gray-400">Dark Theme Preset</p>
          <p className="text-white font-semibold">{preset.name}</p>
        </div>
      </div>

      {/* Color Palette */}
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm font-semibold text-gray-300 mb-3">Color Palette</p>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-gray-600"
                style={{ backgroundColor: value }}
              />
              <div className="text-xs">
                <p className="text-gray-400 capitalize">{key}</p>
                <p className="text-white font-mono">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-300">{preset.description}</p>
      </div>
    </div>
  );
};
