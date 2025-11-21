
import React from 'react';

export const WarlockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Grimoire/Book */}
    <rect x="16" y="10" width="32" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
    {/* Book spine */}
    <line x1="32" y1="10" x2="32" y2="50" stroke="currentColor" strokeWidth="1" />
    {/* Pages */}
    <line x1="20" y1="18" x2="44" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    <line x1="20" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    <line x1="20" y1="30" x2="44" y2="30" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    <line x1="20" y1="36" x2="44" y2="36" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    <line x1="20" y1="42" x2="44" y2="42" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    {/* Dark aura */}
    <circle cx="32" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
  </svg>
);