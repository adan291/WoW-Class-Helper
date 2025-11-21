
import React from 'react';

export const EvokerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Dragon head */}
    <path d="M32 12 L40 18 L38 26 L32 28 L26 26 L24 18 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    {/* Dragon snout */}
    <path d="M38 22 L44 20 L42 24 Z" fill="currentColor" stroke="currentColor" strokeWidth="0.8" />
    {/* Dragon eye */}
    <circle cx="35" cy="20" r="1.5" fill="currentColor" />
    {/* Dragon wings */}
    <path d="M26 24 Q16 20 14 32 Q16 28 26 30 Z" fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="0.8" />
    <path d="M38 24 Q48 20 50 32 Q48 28 38 30 Z" fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="0.8" />
    {/* Dragon tail */}
    <path d="M32 28 Q32 40 28 50 Q30 45 32 40 Q34 45 36 50 Q32 40 32 28" fill="none" stroke="currentColor" strokeWidth="1.5" />
    {/* Draconic aura */}
    <circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
  </svg>
);