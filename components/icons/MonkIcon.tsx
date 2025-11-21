
import React from 'react';

export const MonkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Yin-Yang symbol */}
    <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
    {/* Top half */}
    <path d="M32 18 A14 14 0 0 1 32 46 A7 7 0 0 1 32 32 A7 7 0 0 0 32 18 Z" fill="currentColor" opacity="0.7" />
    {/* Bottom half */}
    <path d="M32 46 A14 14 0 0 1 32 18 A7 7 0 0 1 32 32 A7 7 0 0 0 32 46 Z" fill="currentColor" opacity="0.3" />
    {/* Dots */}
    <circle cx="32" cy="25" r="1.5" fill="currentColor" />
    <circle cx="32" cy="39" r="1.5" fill="currentColor" />
    {/* Martial aura */}
    <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
  </svg>
);