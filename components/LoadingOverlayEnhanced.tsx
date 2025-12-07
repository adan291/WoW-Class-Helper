import React from 'react';

interface LoadingOverlayEnhancedProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export const LoadingOverlayEnhanced: React.FC<LoadingOverlayEnhancedProps> = ({
  isVisible,
  message = 'Loading',
  subMessage,
  fullScreen = true,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`${fullScreen ? 'fixed' : 'absolute'} inset-0 z-[9999] flex items-center justify-center`}
      style={{ background: 'rgba(2, 6, 23, 0.92)', backdropFilter: 'blur(4px)' }}
      role="alert"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Simple spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-3 border-gray-700" />
          <div
            className="absolute inset-0 rounded-full border-3 border-transparent border-t-yellow-500 animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
          {/* Center glow */}
          <div className="absolute inset-2 rounded-full bg-yellow-500/10" />
        </div>

        {/* Message with animated dots */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xl font-semibold text-yellow-500">
            <span>{message}</span>
            <span className="flex gap-0.5 ml-1">
              <span className="animate-bounce inline-block" style={{ animationDelay: '0ms', animationDuration: '0.6s' }}>.</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: '150ms', animationDuration: '0.6s' }}>.</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: '300ms', animationDuration: '0.6s' }}>.</span>
            </span>
          </div>

          {subMessage && (
            <p className="mt-2 text-sm text-gray-400">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlayEnhanced;
