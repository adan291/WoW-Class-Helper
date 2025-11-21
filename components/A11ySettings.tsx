import React, { useState, useEffect, useCallback } from 'react';

interface A11yPreferences {
  screenReaderMode: boolean;
  focusIndicator: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: 'none' | 'tritanopia' | 'deuteranopia' | 'protanopia';
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
}

interface A11ySettingsProps {
  preferences: A11yPreferences;
  onPreferencesChange?: (preferences: A11yPreferences) => void;
}

export const A11ySettings: React.FC<A11ySettingsProps> = ({
  preferences,
  onPreferencesChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handlePreferenceChange = useCallback(
    (key: keyof A11yPreferences, value: any) => {
      const updated = { ...localPreferences, [key]: value };
      setLocalPreferences(updated);
      onPreferencesChange?.(updated);
    },
    [localPreferences, onPreferencesChange]
  );

  const handleReset = useCallback(() => {
    const defaults: A11yPreferences = {
      screenReaderMode: false,
      focusIndicator: false,
      keyboardNavigation: false,
      colorBlindMode: 'none',
      fontSize: 'normal',
      highContrast: false,
      reduceMotion: false,
    };
    setLocalPreferences(defaults);
    onPreferencesChange?.(defaults);
  }, [onPreferencesChange]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white transition-all hover:border-blue-500 hover:bg-gray-700"
        title="Accessibility settings"
      >
        <span className="text-lg">♿</span>
        <span className="text-xs text-gray-400">▼</span>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Accessibility</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Screen Reader Mode */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-white">Screen Reader</h4>
            <p className="text-xs text-gray-400">Optimize for screen readers</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.screenReaderMode}
                onChange={(e) =>
                  handlePreferenceChange('screenReaderMode', e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm text-gray-300">Enable screen reader mode</span>
            </label>
          </div>

          {/* Focus Indicator */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-white">Focus Indicator</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.focusIndicator}
                onChange={(e) =>
                  handlePreferenceChange('focusIndicator', e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm text-gray-300">Show focus indicator</span>
            </label>
          </div>

          {/* Keyboard Navigation */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-white">Keyboard Navigation</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.keyboardNavigation}
                onChange={(e) =>
                  handlePreferenceChange('keyboardNavigation', e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm text-gray-300">Enable keyboard shortcuts</span>
            </label>
          </div>

          {/* Color Blind Mode */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-white">Color Blind Mode</h4>
            <select
              value={localPreferences.colorBlindMode}
              onChange={(e) =>
                handlePreferenceChange(
                  'colorBlindMode',
                  e.target.value as A11yPreferences['colorBlindMode']
                )
              }
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="none">None</option>
              <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              <option value="deuteranopia">Deuteranopia (Green-Red)</option>
              <option value="protanopia">Protanopia (Red-Green)</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-white">Font Size</h4>
            <select
              value={localPreferences.fontSize}
              onChange={(e) =>
                handlePreferenceChange(
                  'fontSize',
                  e.target.value as A11yPreferences['fontSize']
                )
              }
              className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>

          {/* High Contrast */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-white">Contrast</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.highContrast}
                onChange={(e) =>
                  handlePreferenceChange('highContrast', e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm text-gray-300">Increase color contrast</span>
            </label>
          </div>

          {/* Reduce Motion */}
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-white">Motion</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localPreferences.reduceMotion}
                onChange={(e) =>
                  handlePreferenceChange('reduceMotion', e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm text-gray-300">Minimize animations</span>
            </label>
          </div>

          {/* Reset Button */}
          <div className="flex gap-2 border-t border-gray-700 pt-4">
            <button
              onClick={handleReset}
              className="flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-all hover:border-gray-500 hover:bg-gray-700"
            >
              Reset to Defaults
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-all hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default A11ySettings;
