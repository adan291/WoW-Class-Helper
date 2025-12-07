import React from 'react';

interface LoadingOverlayEnhancedProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
  variant?: 'default' | 'arcane' | 'fire' | 'frost' | 'nature' | 'gold';
  fullScreen?: boolean;
}

const variantStyles = {
  default: {
    primary: '#FFD700',
    secondary: '#FFA500',
    glow: 'rgba(255, 215, 0, 0.5)',
    bg: 'from-yellow-900/20 to-orange-900/20',
  },
  arcane: {
    primary: '#A335EE',
    secondary: '#9482CA',
    glow: 'rgba(163, 53, 238, 0.5)',
    bg: 'from-purple-900/20 to-violet-900/20',
  },
  fire: {
    primary: '#FF4500',
    secondary: '#FF6B35',
    glow: 'rgba(255, 69, 0, 0.5)',
    bg: 'from-red-900/20 to-orange-900/20',
  },
  frost: {
    primary: '#3FC7EB',
    secondary: '#69CCF0',
    glow: 'rgba(63, 199, 235, 0.5)',
    bg: 'from-cyan-900/20 to-blue-900/20',
  },
  nature: {
    primary: '#00FF96',
    secondary: '#ABD473',
    glow: 'rgba(0, 255, 150, 0.5)',
    bg: 'from-green-900/20 to-emerald-900/20',
  },
  gold: {
    primary: '#FFD700',
    secondary: '#DAA520',
    glow: 'rgba(255, 215, 0, 0.6)',
    bg: 'from-yellow-900/30 to-amber-900/30',
  },
};

export const LoadingOverlayEnhanced: React.FC<LoadingOverlayEnhancedProps> = ({
  isVisible,
  message = 'Loading...',
  subMessage,
  variant = 'gold',
  fullScreen = true,
}) => {
  const styles = variantStyles[variant];

  if (!isVisible) return null;

  return (
    <div
      className={`${fullScreen ? 'fixed' : 'absolute'} inset-0 z-[9999] flex items-center justify-center`}
      style={{
        background: 'rgba(2, 6, 23, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
      role="alert"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg} opacity-50`} />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              backgroundColor: styles.primary,
              opacity: 0.3,
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: `0 0 20px ${styles.glow}`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8 animate-fade-in">
        {/* Spinner container */}
        <div className="relative">
          {/* Outer glow ring */}
          <div
            className="absolute -inset-4 rounded-full animate-pulse"
            style={{
              background: `radial-gradient(circle, ${styles.glow} 0%, transparent 70%)`,
            }}
          />

          {/* Main spinner */}
          <div className="relative w-24 h-24">
            {/* Outer rotating ring */}
            <svg
              className="w-full h-full animate-spin"
              style={{ animationDuration: '2s' }}
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={styles.primary} />
                  <stop offset="100%" stopColor={styles.secondary} />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#spinner-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="160 100"
                style={{
                  filter: `drop-shadow(0 0 10px ${styles.glow})`,
                }}
              />
            </svg>

            {/* Inner counter-rotating ring */}
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ animation: 'spin 3s linear infinite reverse' }}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke={styles.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="40 60"
                opacity="0.5"
              />
            </svg>

            {/* Center icon with pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="text-3xl animate-bounce-subtle"
                style={{
                  filter: `drop-shadow(0 0 8px ${styles.glow})`,
                }}
              >
                ⚔️
              </div>
            </div>
          </div>

          {/* Orbiting dots */}
          <div
            className="absolute inset-0 w-24 h-24"
            style={{ animation: 'spin 4s linear infinite' }}
          >
            <div
              className="absolute w-3 h-3 rounded-full"
              style={{
                top: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: styles.primary,
                boxShadow: `0 0 12px ${styles.glow}`,
              }}
            />
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-3">
          <h2
            className="text-2xl font-bold tracking-wide"
            style={{
              color: styles.primary,
              textShadow: `0 0 20px ${styles.glow}, 0 2px 4px rgba(0,0,0,0.8)`,
            }}
          >
            {message}
          </h2>

          {/* Animated dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-loading-dots"
                style={{
                  backgroundColor: styles.primary,
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>

          {subMessage && (
            <p className="text-gray-300 text-sm max-w-xs mx-auto leading-relaxed">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlayEnhanced;
