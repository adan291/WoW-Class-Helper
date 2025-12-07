import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      {/* Simple spinner */}
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-gray-700" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-500 animate-spin"
          style={{ animationDuration: '0.8s' }}
        />
      </div>

      {/* Message with animated dots */}
      {message && (
        <div className="flex items-center gap-1 text-yellow-500 font-medium">
          <span>{message}</span>
          <span className="flex gap-0.5">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
              .
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay: React.FC<LoadingSpinnerProps & { fullScreen?: boolean }> = ({
  fullScreen = false,
  ...props
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-sm'
    : 'absolute inset-0 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg';

  return (
    <div className={`${containerClass} flex items-center justify-center`}>
      <LoadingSpinner {...props} />
    </div>
  );
};

export default LoadingSpinner;
