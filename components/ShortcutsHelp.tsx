/**
 * Shortcuts Help Component
 * Displays keyboard shortcuts help
 */

import React, { useState } from 'react';
import { getShortcutText } from '../hooks/useKeyboardShortcuts.ts';

export const ShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    {
      action: 'Search',
      key: 'search',
      description: 'Open global search',
      icon: '🔍',
    },
    {
      action: 'Bookmark',
      key: 'bookmark',
      description: 'Bookmark current guide',
      icon: '⭐',
    },
    {
      action: 'Export',
      key: 'export',
      description: 'Export current content',
      icon: '📤',
    },
    {
      action: 'Preferences',
      key: 'preferences',
      description: 'Open preferences',
      icon: '⚙️',
    },
    {
      action: 'Help',
      key: 'help',
      description: 'Show this help',
      icon: '❓',
    },
    {
      action: 'Next Tab',
      key: 'nextTab',
      description: 'Navigate to next tab',
      icon: '→',
    },
    {
      action: 'Previous Tab',
      key: 'prevTab',
      description: 'Navigate to previous tab',
      icon: '←',
    },
    {
      action: 'Close Modal',
      key: 'closeModal',
      description: 'Close any open modal',
      icon: '✕',
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition"
        title="Keyboard Shortcuts (Ctrl+/)"
      >
        ⌨️
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">⌨️ Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-200 font-medium flex items-center gap-2">
                        <span className="text-lg">{shortcut.icon}</span>
                        {shortcut.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{shortcut.description}</p>
                    </div>
                    <div className="ml-2 px-2 py-1 bg-gray-800 rounded text-xs font-mono text-yellow-400 whitespace-nowrap">
                      {getShortcutText(shortcut.key)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-200">
              <p className="font-bold mb-1">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use Ctrl (or Cmd on Mac) + key for most shortcuts</li>
                <li>Press Escape to close any modal or dialog</li>
                <li>Shortcuts work from anywhere in the app</li>
              </ul>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ShortcutsHelp);
