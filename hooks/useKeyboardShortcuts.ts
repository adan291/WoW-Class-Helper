/**
 * useKeyboardShortcuts Hook
 * 
 * Provides keyboard shortcuts for the application
 * Supports common navigation and action shortcuts
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

const SHORTCUTS: Record<string, Omit<KeyboardShortcut, 'action'>> = {
  'search': {
    key: '/',
    description: 'Focus search bar',
  },
  'help': {
    key: '?',
    description: 'Show keyboard shortcuts',
  },
  'escape': {
    key: 'Escape',
    description: 'Close modals/panels',
  },
  'nextTab': {
    key: 'ArrowRight',
    ctrl: true,
    description: 'Next tab',
  },
  'prevTab': {
    key: 'ArrowLeft',
    ctrl: true,
    description: 'Previous tab',
  },
  'favorite': {
    key: 's',
    ctrl: true,
    description: 'Toggle favorite',
  },
  'export': {
    key: 'e',
    ctrl: true,
    description: 'Export guide',
  },
  'print': {
    key: 'p',
    ctrl: true,
    description: 'Print guide',
  },
};

/**
 * Get human-readable shortcut text
 */
export const getShortcutText = (shortcutKey: string): string => {
  const shortcut = SHORTCUTS[shortcutKey];
  if (!shortcut) return '';

  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key);

  return parts.join(' + ');
};

/**
 * Get all available shortcuts
 */
export const getAllShortcuts = (): Array<{ key: string; text: string; description: string }> => {
  return Object.entries(SHORTCUTS).map(([key, shortcut]) => ({
    key,
    text: getShortcutText(key),
    description: shortcut.description,
  }));
};

/**
 * Hook for registering keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  shortcuts: Record<string, () => void>,
  enabled = true
): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for each registered shortcut
      Object.entries(shortcuts).forEach(([shortcutKey, action]) => {
        const shortcut = SHORTCUTS[shortcutKey];
        if (!shortcut) return;

        const keyMatches = event.key === shortcut.key || event.code === shortcut.key;
        const ctrlMatches = (shortcut.ctrl || false) === (event.ctrlKey || event.metaKey);
        const shiftMatches = (shortcut.shift || false) === event.shiftKey;
        const altMatches = (shortcut.alt || false) === event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

/**
 * Hook for a single keyboard shortcut
 */
export const useKeyboardShortcut = (
  shortcutKey: string,
  action: () => void,
  enabled = true
): void => {
  useKeyboardShortcuts({ [shortcutKey]: action }, enabled);
};
