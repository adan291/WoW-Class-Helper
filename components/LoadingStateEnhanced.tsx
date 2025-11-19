import React from 'react';
import '../styles/animations.css';

interface LoadingStateEnhancedProps {
  classColor?: string;
  message?: string;
}

/**
 * Enhanced loading state with WoW theming
 * Features:
 * - Animated WoW-style spinner
 * - Class-colored effects
 * - Loading message
 * - Shimmer effects
 */
export const LoadingStateEnhanced: React.FC<LoadingStateEnhancedProps> = ({
  classColor = '#FFD700',
  message = 'Generating guide...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent spin"
          style={{
            borderTopColor: classColor,
            borderRightColor: classColor,
            animation: 'spin 2s linear infinite',
          }}
        />

        {/* Middle ring */}
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent"
          style={{
            borderBottomColor: classColor,
            borderLeftColor: classColor,
            animation: 'spin 3s linear infinite reverse',
          }}
        />

        {/* Inner glow */}
        <div
          className="absolute inset-4 rounded-full"
          style={{
            background: `radial-gradient(circle, ${classColor}40 0%, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />

        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: classColor,
            boxShadow: `0 0 10px ${classColor}`,
          }}
        />
      </div>

      {/* Loading text */}
      <div className="text-center">
        <p
          className="text-lg font-bold mb-2 transition-all duration-300"
          style={{ color: classColor }}
        >
          {message}
        </p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: classColor,
                animation: `pulse 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Shimmer effect background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${classColor}, transparent)`,
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
};

export default React.memo(LoadingStateEnhanced);
