import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  subMessage?: string;
  variant?: 'default' | 'arcane' | 'fire' | 'frost' | 'nature';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const variantColors = {
  default: {
    primary: '#FFD700',
    secondary: '#FFA500',
    glow: 'rgba(255, 215, 0, 0.4)',
  },
  arcane: {
    primary: '#9482CA',
    secondary: '#A335EE',
    glow: 'rgba(148, 130, 202, 0.4)',
  },
  fire: {
    primary: '#FF4500',
    secondary: '#FF6B35',
    glow: 'rgba(255, 69, 0, 0.4)',
  },
  frost: {
    primary: '#3FC7EB',
    secondary: '#69CCF0',
    glow: 'rgba(63, 199, 235, 0.4)',
  },
  nature: {
    primary: '#00FF96',
    secondary: '#ABD473',
    glow: 'rgba(0, 255, 150, 0.4)',
  },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  message,
  subMessage,
  variant = 'default',
}) => {
  const colors = variantColors[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      {/* Spinner Container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-ping opacity-20`}
          style={{ backgroundColor: colors.glow }}
        />

        {/* Main spinner */}
        <div className={`relative ${sizeClasses[size]}`}>
          {/* Outer ring */}
          <svg className="w-full h-full animate-spin" viewBox="0 0 50 50">
            <defs>
              <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} />
                <stop offset="100%" stopColor={colors.secondary} />
              </linearGradient>
            </defs>
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke={`url(#gradient-${variant})`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="80 50"
              style={{
                filter: `drop-shadow(0 0 8px ${colors.glow})`,
              }}
            />
          </svg>

          {/* Inner pulsing core */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: 'scale(0.4)' }}
          >
            <div
              className="w-full h-full rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)`,
              }}
            />
          </div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-lg animate-pulse"
              style={{
                filter: `drop-shadow(0 0 4px ${colors.glow})`,
              }}
            >
              ⚔️
            </span>
          </div>
        </div>

        {/* Orbiting particles */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]}`}
          style={{ animation: 'spin 3s linear infinite reverse' }}
        >
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: colors.primary,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-6 text-center">
          <p
            className="text-lg font-bold tracking-wide"
            style={{
              color: colors.primary,
              textShadow: `0 0 10px ${colors.glow}`,
            }}
          >
            {message}
          </p>
          {subMessage && <p className="mt-2 text-sm text-gray-400">{subMessage}</p>}
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

// Skeleton loader for content
const skeletonWidths = ['100%', '85%', '92%', '78%', '88%', '95%', '82%', '90%'];

export const ContentSkeleton: React.FC<{ lines?: number }> = ({ lines = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div
            className="h-4 bg-gray-800 rounded"
            style={{ width: skeletonWidths[i % skeletonWidths.length] }}
          />
          {i % 2 === 0 && <div className="h-4 bg-gray-800/60 rounded w-3/4" />}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
