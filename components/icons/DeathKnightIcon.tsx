
import React from 'react';

export const DeathKnightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Skull */}
    <circle cx="32" cy="24" r="10" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    {/* Eye sockets */}
    <circle cx="27" cy="22" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
    <circle cx="37" cy="22" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
    {/* Nose cavity */}
    <path d="M32 26 L30 28 L34 28 Z" fill="currentColor" />
    {/* Teeth */}
    <line x1="26" y1="30" x2="38" y2="30" stroke="currentColor" strokeWidth="0.8" />
    <line x1="27" y1="31" x2="28" y2="31" stroke="currentColor" strokeWidth="0.5" />
    <line x1="30" y1="31" x2="31" y2="31" stroke="currentColor" strokeWidth="0.5" />
    <line x1="33" y1="31" x2="34" y2="31" stroke="currentColor" strokeWidth="0.5" />
    <line x1="36" y1="31" x2="37" y2="31" stroke="currentColor" strokeWidth="0.5" />
    {/* Jaw */}
    <path d="M22 30 Q32 38 42 30" fill="none" stroke="currentColor" strokeWidth="1.5" />
    {/* Necromantic aura */}
    <circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
  </svg>
);