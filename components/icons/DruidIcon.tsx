
import React from 'react';

export const DruidIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Tree trunk */}
    <rect x="28" y="28" width="8" height="28" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
    {/* Tree foliage - top */}
    <circle cx="32" cy="18" r="10" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    {/* Tree foliage - sides */}
    <circle cx="20" cy="26" r="8" fill="currentColor" stroke="currentColor" strokeWidth="1" opacity="0.8" />
    <circle cx="44" cy="26" r="8" fill="currentColor" stroke="currentColor" strokeWidth="1" opacity="0.8" />
    {/* Roots */}
    <path d="M26 56 Q20 60 18 62 M32 56 L32 62 M38 56 Q44 60 46 62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Nature aura */}
    <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
);