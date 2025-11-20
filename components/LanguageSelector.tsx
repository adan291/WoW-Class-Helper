/**
 * Language Selector Component
 * Select and manage application language
 */

import React, { useState, useCallback } from 'react';
import { i18nService, Language } from '../services/i18nService';

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    i18nService.getCurrentLanguage()
  );
  const [isOpen, setIsOpen] = useState(false);

  const languages = i18nService.getAvailableLanguages();
  const stats = i18nService.getTranslationStats();

  const handleLanguageChange = useCallback(
    (language: Language) => {
      if (i18nService.setLanguage(language)) {
        setCurrentLanguage(language);
        setIsOpen(false);
        onLanguageChange?.(language);
      }
    },
    [onLanguageChange]
  );

  const currentConfig = i18nService.getLanguageConfig(currentLanguage);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 hover:border-gray-600 transition"
        title="Change language"
      >
        <span className="text-lg">🌐</span>
        <span className="text-sm font-semibold">{currentConfig?.nativeName}</span>
        <span className="text-xs text-gray-400">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 rounded-lg border border-gray-700 shadow-lg z-50">
          {/* Header */}
          <div className="p-3 border-b border-gray-700">
            <p className="text-xs font-semibold text-gray-400">SELECT LANGUAGE</p>
          </div>

          {/* Language Options */}
          <div className="divide-y divide-gray-700">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-3 text-left text-sm transition ${
                  currentLanguage === lang.code
                    ? 'bg-blue-900 bg-opacity-50 text-blue-300 font-semibold'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{lang.nativeName}</p>
                    <p className="text-xs text-gray-500">{lang.name}</p>
                  </div>
                  {currentLanguage === lang.code && (
                    <span className="text-blue-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-700 text-xs text-gray-500">
            <p>
              {stats.keysPerLanguage[currentLanguage]} translations loaded
            </p>
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
 * Language Info Panel Component
 * Display language and localization information
 */
interface LanguageInfoPanelProps {
  language?: Language;
}

export const LanguageInfoPanel: React.FC<LanguageInfoPanelProps> = ({
  language = i18nService.getCurrentLanguage(),
}) => {
  const config = i18nService.getLanguageConfig(language);
  const stats = i18nService.getTranslationStats();

  if (!config) return null;

  const now = new Date();
  const formattedDate = i18nService.formatDate(now, language);
  const formattedTime = i18nService.formatTime(now, language);
  const formattedNumber = i18nService.formatNumber(1234567, language);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Language Information</h3>

      {/* Language Details */}
      <div className="space-y-3">
        <div className="p-3 bg-gray-800 rounded">
          <p className="text-xs text-gray-400">Language</p>
          <p className="text-white font-semibold">{config.nativeName}</p>
        </div>

        <div className="p-3 bg-gray-800 rounded">
          <p className="text-xs text-gray-400">Code</p>
          <p className="text-white font-semibold">{config.code}</p>
        </div>

        <div className="p-3 bg-gray-800 rounded">
          <p className="text-xs text-gray-400">Text Direction</p>
          <p className="text-white font-semibold capitalize">{config.direction}</p>
        </div>

        <div className="p-3 bg-gray-800 rounded">
          <p className="text-xs text-gray-400">Translations</p>
          <p className="text-white font-semibold">
            {stats.keysPerLanguage[language]} keys
          </p>
        </div>
      </div>

      {/* Format Examples */}
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm font-semibold text-gray-300 mb-3">Format Examples</p>

        <div className="space-y-2 text-sm">
          <div className="p-2 bg-gray-800 rounded">
            <p className="text-xs text-gray-400">Date Format</p>
            <p className="text-white">{formattedDate}</p>
          </div>

          <div className="p-2 bg-gray-800 rounded">
            <p className="text-xs text-gray-400">Time Format</p>
            <p className="text-white">{formattedTime}</p>
          </div>

          <div className="p-2 bg-gray-800 rounded">
            <p className="text-xs text-gray-400">Number Format</p>
            <p className="text-white">{formattedNumber}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm font-semibold text-gray-300 mb-3">Statistics</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-800 rounded text-center">
            <p className="text-xs text-gray-400">Total Languages</p>
            <p className="text-lg font-bold text-blue-400">{stats.languages}</p>
          </div>

          <div className="p-2 bg-gray-800 rounded text-center">
            <p className="text-xs text-gray-400">Avg Keys/Lang</p>
            <p className="text-lg font-bold text-green-400">
              {Math.round(
                Object.values(stats.keysPerLanguage).reduce((a, b) => a + b, 0) /
                  stats.languages
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
