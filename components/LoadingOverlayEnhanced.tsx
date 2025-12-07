import React, { useEffect, useState } from 'react';

interface LoadingOverlayEnhancedProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
  variant?: 'default' | 'arcane' | 'fire' | 'frost' | 'nature' | 'gold';
  fullScreen?: boolean;
}

const variantStyles = {
  default: { primary: '#FFD700', secondary: '#FFA500', glow: 'rgba(255, 215, 0, 0.6)' },
  arcane: { primary: '#A335EE', secondary: '#9482CA', glow: 'rgba(163, 53, 238, 0.6)' },
  fire: { primary: '#FF4500', secondary: '#FF6B35', glow: 'rgba(255, 69, 0, 0.6)' },
  frost: { primary: '#3FC7EB', secondary: '#69CCF0', glow: 'rgba(63, 199, 235, 0.6)' },
  nature: { primary: '#00FF96', secondary: '#ABD473', glow: 'rgba(0, 255, 150, 0.6)' },
  gold: { primary: '#FFD700', secondary: '#DAA520', glow: 'rgba(255, 215, 0, 0.7)' },
};

// Animated dot component with state-based animation
const AnimatedDot: React.FC<{ color: string; glow: string; delay: number }> = ({ color, glow, delay }) => {
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale(prev => prev === 0.5 ? 1.2 : 0.5);
      setOpacity(prev => prev === 0.3 ? 1 : 0.3);
    }, 400);

    const timeout = setTimeout(() => {
      // Start after delay
    }, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [delay]);

  return (
    <div
      style={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 12px ${glow}`,
        transform: `scale(${scale})`,
        opacity: opacity,
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
      }}
    />
  );
};

// Rotating element with state-based animation
const RotatingRing: React.FC<{ children: React.ReactNode; duration: number; reverse?: boolean }> = ({
  children, duration, reverse = false
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + (reverse ? -6 : 6)) % 360);
    }, duration / 60);

    return () => clearInterval(interval);
  }, [duration, reverse]);

  return (
    <div style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.05s linear' }}>
      {children}
    </div>
  );
};

export const LoadingOverlayEnhanced: React.FC<LoadingOverlayEnhancedProps> = ({
  isVisible,
  message = 'Loading...',
  subMessage,
  variant = 'gold',
  fullScreen = true,
}) => {
  const styles = variantStyles[variant];
  const [pulseScale, setPulseScale] = useState(1);
  const [glowOpacity, setGlowOpacity] = useState(0.5);
  const [bounceY, setBounceY] = useState(0);
  const [waveScale, setWaveScale] = useState([0.3, 0.3, 0.3]);
  const [waveOpacity, setWaveOpacity] = useState([0.8, 0.8, 0.8]);

  // Pulse animation
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.15 : 1);
      setGlowOpacity(prev => prev === 0.5 ? 0.9 : 0.5);
    }, 800);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Bounce animation
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setBounceY(prev => prev === 0 ? -10 : 0);
    }, 600);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Wave expansion animation
  useEffect(() => {
    if (!isVisible) return;

    const animateWave = (index: number) => {
      let scale = 0.3;
      let opacity = 0.8;

      const interval = setInterval(() => {
        scale += 0.05;
        opacity -= 0.015;

        if (scale >= 2.5) {
          scale = 0.3;
          opacity = 0.8;
        }

        setWaveScale(prev => {
          const newArr = [...prev];
          newArr[index] = scale;
          return newArr;
        });
        setWaveOpacity(prev => {
          const newArr = [...prev];
          newArr[index] = Math.max(0, opacity);
          return newArr;
        });
      }, 50);

      return interval;
    };

    const intervals = [
      animateWave(0),
      setTimeout(() => animateWave(1), 1000),
      setTimeout(() => animateWave(2), 2000),
    ];

    return () => {
      clearInterval(intervals[0] as unknown as number);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`${fullScreen ? 'fixed' : 'absolute'} inset-0 z-[9999] flex items-center justify-center overflow-hidden`}
      style={{ background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(8px)' }}
      role="alert"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${styles.glow} 0%, transparent 50%)`,
          opacity: glowOpacity,
          transform: `scale(${pulseScale * 1.5})`,
          transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
        }}
      />

      {/* Expanding wave rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={`wave-${i}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '120px',
            height: '120px',
            marginLeft: '-60px',
            marginTop: '-60px',
            borderRadius: '50%',
            border: `2px solid ${styles.primary}`,
            transform: `scale(${waveScale[i]})`,
            opacity: waveOpacity[i],
            transition: 'transform 0.05s linear, opacity 0.05s linear',
          }}
        />
      ))}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>

        {/* Spinner container */}
        <div style={{ position: 'relative' }}>
          {/* Pulsing glow */}
          <div
            style={{
              position: 'absolute',
              inset: '-30px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${styles.glow} 0%, transparent 70%)`,
              opacity: glowOpacity,
              transform: `scale(${pulseScale})`,
              transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
            }}
          />

          {/* Main spinner - 100x100 */}
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            {/* Outer rotating ring */}
            <RotatingRing duration={2000}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id={`grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={styles.primary} />
                    <stop offset="100%" stopColor={styles.secondary} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke={`url(#grad-${variant})`}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="140 120"
                  style={{ filter: `drop-shadow(0 0 15px ${styles.glow})` }}
                />
              </svg>
            </RotatingRing>

            {/* Inner counter-rotating ring */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <RotatingRing duration={3000} reverse>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="28"
                    fill="none"
                    stroke={styles.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="25 40"
                    opacity="0.7"
                    style={{ filter: `drop-shadow(0 0 8px ${styles.glow})` }}
                  />
                </svg>
              </RotatingRing>
            </div>

            {/* Center icon with bounce */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '36px',
                  transform: `translateY(${bounceY}px)`,
                  transition: 'transform 0.3s ease-in-out',
                  filter: `drop-shadow(0 0 12px ${styles.glow})`,
                }}
              >
                ⚔️
              </span>
            </div>
          </div>

          {/* Orbiting dot */}
          <div style={{ position: 'absolute', inset: 0, width: '100px', height: '100px' }}>
            <RotatingRing duration={2500}>
              <div
                style={{
                  position: 'absolute',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  top: '-7px',
                  left: '43px',
                  backgroundColor: styles.primary,
                  boxShadow: `0 0 20px ${styles.glow}, 0 0 40px ${styles.glow}`,
                  opacity: glowOpacity + 0.3,
                  transform: `scale(${pulseScale * 0.9})`,
                  transition: 'opacity 0.4s, transform 0.4s',
                }}
              />
            </RotatingRing>
          </div>
        </div>

        {/* Text content */}
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 'bold',
              letterSpacing: '0.08em',
              color: styles.primary,
              textShadow: `0 0 25px ${styles.glow}, 0 0 50px ${styles.glow}`,
              marginBottom: '20px',
            }}
          >
            {message}
          </h2>

          {/* Animated loading dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <AnimatedDot color={styles.primary} glow={styles.glow} delay={0} />
            <AnimatedDot color={styles.primary} glow={styles.glow} delay={150} />
            <AnimatedDot color={styles.primary} glow={styles.glow} delay={300} />
          </div>

          {subMessage && (
            <p style={{ color: '#e5e7eb', fontSize: '0.9rem', maxWidth: '300px', margin: '20px auto 0', lineHeight: '1.6' }}>
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlayEnhanced;
