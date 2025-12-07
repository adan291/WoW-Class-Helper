/**
 * Fallback Status Bar Component
 * Displays current fallback state and available features
 */

import React, { useState, useEffect } from 'react';
import { fallbackService, type FallbackState } from '../services/fallbackService.ts';

export const FallbackStatusBar: React.FC = () => {
  const [state, setState] = useState<FallbackState>(fallbackService.getState());

  useEffect(() => {
    const unsubscribe = fallbackService.subscribe(setState);
    return unsubscribe;
  }, []);

  // Don't show if everything is normal
  if (state.apiAvailable && !state.offlineMode) {
    return null;
  }

  const getStatusColor = () => {
    if (state.degradedMode) return 'bg-red-900/50 border-red-500';
    if (state.offlineMode) return 'bg-amber-900/50 border-amber-500';
    if (!state.apiAvailable) return 'bg-blue-900/50 border-blue-500';
    return 'bg-green-900/50 border-green-500';
  };

  const getStatusTextColor = () => {
    if (state.degradedMode) return 'text-red-200';
    if (state.offlineMode) return 'text-amber-200';
    if (!state.apiAvailable) return 'text-blue-200';
    return 'text-green-200';
  };

  const getStatusIcon = () => {
    if (state.degradedMode) return '⚠️';
    if (state.offlineMode) return '📡';
    if (!state.apiAvailable) return '🔄';
    return '✅';
  };

  const getAvailableSources = () => {
    const sources = [];
    if (state.apiAvailable) sources.push('API');
    if (state.cacheAvailable) sources.push('Cache');
    if (state.mockDataAvailable) sources.push('Demo');
    return sources.join(' • ');
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 border-b-2 ${getStatusColor()} backdrop-blur-sm`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <p className={`text-sm font-bold ${getStatusTextColor()}`}>
              {fallbackService.getStatusMessage()}
            </p>
            <p className={`text-xs ${getStatusTextColor()} opacity-75`}>
              Available: {getAvailableSources()}
            </p>
          </div>
        </div>

        {state.degradedMode && (
          <div className={`text-xs ${getStatusTextColor()} font-semibold`}>
            Limited Functionality
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FallbackStatusBar);
