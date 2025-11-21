
import React from 'react';

export const WarriorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Sword blade */}
    <path d="M32 8 L36 40 L32 56 L28 40 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    {/* Sword crossguard */}
    <rect x="20" y="38" width="24" height="4" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
    {/* Sword handle */}
    <rect x="30" y="42" width="4" height="10" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
    {/* Shield */}
    <path d="M 12 28 L 16 40 L 12 52 Q 12 58 20 60 Q 28 62 32 62 Q 36 62 44 60 Q 52 58 52 52 L 48 40 L 52 28 Q 52 22 44 20 Q 36 18 32 18 Q 28 18 20 20 Q 12 22 12 28 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
  </svg>
);