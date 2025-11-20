/**
 * Preferences Panel Component
 * User settings and preferences
 */

import React, { useState, useEffect } from 'react';
import { preferencesService, type Theme, type ContentDensity } from '../services/preferencesService.ts';
import { toastService } from '../services/toastService.ts';

export const PreferencesPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [fontSize, setFontSize] = useState(16);
  const [density, setDensity] = useState<ContentDensity>('normal');

  useEffect(() => {
    const prefs = preferencesService.getPreferences();
    setTheme(prefs.theme);
    setFontSize(prefs.fontSize);
    setDensity(prefs.contentDensity);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    preferencesService.setTheme(newTheme);
    toastService.success(`Theme changed to ${newTheme}`);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    preferencesService.setFontSize(size);
  };

  const handleDensityChange = (newDensity: ContentDensity) => {
    setDensity(newDensity);
    preferencesService.setContentDensity(newDensity);
  };

  const handleReset = () => {
    preferencesService.resetToDefaults();
    const prefs = preferencesService.getPreferences();
    setTheme(prefs.theme);
    setFontSize(prefs.fontSize);
    setDensity(prefs.contentDensity);
    toastService.success('Preferences reset to defaults');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition"
        title="Preferences"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">Preferences</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">Theme</label>
              <div className="flex gap-2">
                {(['dark', 'light', 'auto'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      theme === t
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {t === 'dark' && '🌙'}
                    {t === 'light' && '☀️'}
                    {t === 'auto' && '🔄'}
                    {' ' + t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Content Density */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">Content Density</label>
              <div className="flex gap-2">
                {(['compact', 'normal', 'comfortable'] as ContentDensity[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDensityChange(d)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      density === d
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {d === 'compact' && '📦'}
                    {d === 'normal' && '📄'}
                    {d === 'comfortable' && '📖'}
                    {' ' + d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg font-medium transition"
            >
              🔄 Reset to Defaults
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(PreferencesPanel);
