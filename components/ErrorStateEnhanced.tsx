import React from 'react';
import '../styles/animations.css';

interface ErrorStateEnhancedProps {
  classColor?: string;
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * Enhanced error state with WoW theming
 * Features:
 * - Animated error icon
 * - Class-colored styling
 * - Retry button with effects
 * - Detailed error message
 */
export const ErrorStateEnhanced: React.FC<ErrorStateEnhancedProps> = ({
  classColor = '#FF6B6B',
  title = 'Unable to Load Guide',
  message = 'An error occurred while generating the guide. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 scale-in">
      {/* Error icon */}
      <div className="relative">
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{
            background: classColor,
            width: '120px',
            height: '120px',
            left: '-20px',
            top: '-20px',
          }}
        />

        {/* Icon container */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: `${classColor}20`,
            border: `2px solid ${classColor}`,
            boxShadow: `0 0 20px ${classColor}60, inset 0 0 15px ${classColor}20`,
          }}
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: classColor }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Error message */}
      <div className="text-center max-w-md">
        <h3
          className="text-2xl font-bold mb-2"
          style={{ color: classColor }}
        >
          {title}
        </h3>
        <p className="text-gray-300 mb-6">
          {message}
        </p>

        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 lift-on-hover flex items-center gap-2 group mx-auto"
            style={{
              background: `${classColor}20`,
              color: classColor,
              border: `2px solid ${classColor}`,
              boxShadow: `0 0 15px ${classColor}40`,
            }}
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        )}
      </div>

      {/* Decorative elements */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${classColor}, transparent)`,
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
};

export default React.memo(ErrorStateEnhanced);
