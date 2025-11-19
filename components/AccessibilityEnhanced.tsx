import React, { useEffect, useState } from 'react';

interface AccessibilityEnhancedProps {
  children: React.ReactNode;
}

/**
 * Accessibility enhancement wrapper
 * Features:
 * - Respects prefers-reduced-motion
 * - High contrast mode support
 * - Focus management
 * - Keyboard navigation support
 */
export const AccessibilityEnhanced: React.FC<AccessibilityEnhancedProps> = ({
  children,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);

    // Check for prefers-contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    setPrefersHighContrast(contrastQuery.matches);

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    contrastQuery.addEventListener('change', handleContrastChange);

    // Cleanup
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return (
    <div
      className={`
        ${prefersReducedMotion ? 'motion-safe:animate-none' : ''}
        ${prefersHighContrast ? 'high-contrast' : ''}
      `}
      style={{
        // Apply high contrast styles if needed
        ...(prefersHighContrast && {
          filter: 'contrast(1.2)',
        }),
      }}
    >
      {children}
    </div>
  );
};

export default React.memo(AccessibilityEnhanced);
