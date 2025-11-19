import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile.ts';

interface ResponsiveGridProps {
  children: React.ReactNode;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  gap?: string;
}

/**
 * Responsive grid component with mobile optimization
 * Features:
 * - Adaptive column count based on screen size
 * - Optimized spacing for mobile
 * - Touch-friendly card sizes
 * - Smooth transitions
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = '1rem',
}) => {
  const isMobile = useIsMobile();

  // Determine columns based on screen size
  const getColumns = () => {
    if (isMobile) return mobileColumns;
    if (window.innerWidth < 1024) return tabletColumns;
    return desktopColumns;
  };

  const columns = getColumns();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        transition: 'grid-template-columns 0.3s ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default React.memo(ResponsiveGrid);
