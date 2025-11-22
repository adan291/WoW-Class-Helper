
import React from 'react';

export const DemonHunterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Left glaive */}
    <path d="M12 20 L16 32 L12 44 L10 42 L10 22 Z" fill="#c41e3a" stroke="#8b1428" strokeWidth="1" />
    {/* Left glaive blade */}
    <path d="M16 32 L24 28 L24 36 Z" fill="#ff6600" stroke="#cc5200" strokeWidth="0.8" />
    {/* Right glaive */}
    <path d="M52 20 L48 32 L52 44 L54 42 L54 22 Z" fill="#c41e3a" stroke="#8b1428" strokeWidth="1" />
    {/* Right glaive blade */}
    <path d="M48 32 L40 28 L40 36 Z" fill="#ff6600" stroke="#cc5200" strokeWidth="0.8" />
    {/* Demonic aura */}
    <circle cx="32" cy="32" r="12" fill="none" stroke="#ff6600" strokeWidth="1.5" opacity="0.6" />
    {/* Demonic spikes */}
    <path d="M32 16 L34 20 M32 48 L34 44 M16 32 L20 34 M48 32 L44 34" stroke="#ff6600" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);