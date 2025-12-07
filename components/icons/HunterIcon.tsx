import React from 'react';

export const HunterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Bow */}
    <path d="M20 15 Q32 8 32 32 Q32 56 20 49" fill="none" stroke="#8b7355" strokeWidth="2" />
    {/* Bowstring */}
    <line x1="20" y1="15" x2="20" y2="49" stroke="#d4af37" strokeWidth="1.5" />
    {/* Arrow */}
    <line x1="20" y1="32" x2="48" y2="32" stroke="#8b4513" strokeWidth="1.5" />
    {/* Arrow head */}
    <path d="M48 32 L44 30 L44 34 Z" fill="#c41e3a" />
    {/* Arrow fletching */}
    <path d="M22 30 L20 32 L22 34" fill="none" stroke="#8b4513" strokeWidth="1" />
    {/* Crosshair/target */}
    <circle cx="32" cy="32" r="8" fill="none" stroke="#00cc00" strokeWidth="1" opacity="0.6" />
    <line x1="32" y1="24" x2="32" y2="20" stroke="#00cc00" strokeWidth="1" opacity="0.6" />
    <line x1="32" y1="44" x2="32" y2="40" stroke="#00cc00" strokeWidth="1" opacity="0.6" />
  </svg>
);
