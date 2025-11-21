import React from 'react';

interface LoadingStateEnhancedProps {
  classColor?: string;
  message?: string;
  retryCount?: number;
  retryTimer?: number;
}

export const LoadingStateEnhanced: React.FC<LoadingStateEnhancedProps> = ({
  classColor = '#FFD700',
  message = 'Generating guide...',
  retryCount = 0,
  retryTimer = 0,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      {/* Spinner using border animation */}
      <div
        className="w-16 h-16 rounded-full border-4 border-transparent"
        style={{
          borderTopColor: classColor,
          borderRightColor: classColor,
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* Loading text */}
      <p
        className="text-xl font-bold"
        style={{
          color: classColor,
        }}
      >
        {retryCount > 0 ? `Retrying... ${retryCount}/3` : message}
      </p>

      {retryCount > 0 && retryTimer > 0 && (
        <p className="text-sm text-gray-400">
          Next attempt in {retryTimer}s
        </p>
      )}
    </div>
  );
};

export default React.memo(LoadingStateEnhanced);


