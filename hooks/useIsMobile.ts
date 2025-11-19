import { useState, useEffect } from 'react';

/**
 * Hook to detect if the device is mobile
 * Returns true if viewport width is less than 768px (md breakpoint)
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check initial size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    // Add resize listener
    const handleResize = () => {
      checkMobile();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
