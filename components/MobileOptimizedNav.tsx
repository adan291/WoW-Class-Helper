import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile.ts';
import '../styles/animations.css';

interface MobileOptimizedNavProps {
  children: React.ReactNode;
  classColor?: string;
}

/**
 * Mobile-optimized navigation wrapper
 * Features:
 * - Responsive touch targets (44px minimum)
 * - Optimized spacing for mobile
 * - Simplified animations on mobile
 * - Better readability on small screens
 */
export const MobileOptimizedNav: React.FC<MobileOptimizedNavProps> = ({
  children,
  classColor = '#FFD700',
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={`
        transition-all duration-300
        ${isMobile ? 'px-2 py-2' : 'px-4 py-3'}
      `}
      style={{
        '--touch-target': isMobile ? '44px' : '40px',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default React.memo(MobileOptimizedNav);
