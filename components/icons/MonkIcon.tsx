import React from 'react';

export const MonkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Yin-Yang symbol */}
    <circle cx="32" cy="32" r="14" fill="none" stroke="#ffd700" strokeWidth="2" />
    {/* Top half - white */}
    <path
      d="M32 18 A14 14 0 0 1 32 46 A7 7 0 0 1 32 32 A7 7 0 0 0 32 18 Z"
      fill="#ffffff"
      opacity="0.95"
    />
    {/* Bottom half - dark */}
    <path
      d="M32 46 A14 14 0 0 1 32 18 A7 7 0 0 1 32 32 A7 7 0 0 0 32 46 Z"
      fill="#1a1a1a"
      opacity="0.95"
    />
    {/* Dots - larger and more visible */}
    <circle cx="32" cy="25" r="2" fill="#1a1a1a" />
    <circle cx="32" cy="39" r="2" fill="#ffffff" />
    {/* Martial aura */}
    <circle cx="32" cy="32" r="18" fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.5" />
  </svg>
);
