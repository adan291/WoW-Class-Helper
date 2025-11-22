
import React from 'react';

export const ShamanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Totem pole - base */}
    <rect x="28" y="40" width="8" height="18" fill="#8b4513" stroke="#5c2d0f" strokeWidth="1" />
    {/* Totem pole - middle */}
    <rect x="26" y="28" width="12" height="12" fill="#8b4513" stroke="#5c2d0f" strokeWidth="1" />
    {/* Totem pole - top */}
    <circle cx="32" cy="18" r="6" fill="#8b4513" stroke="#5c2d0f" strokeWidth="1" />
    {/* Elemental symbols - Earth */}
    <path d="M16 48 L20 52 L16 56 L12 52 Z" fill="none" stroke="#ff6600" strokeWidth="1.5" />
    {/* Elemental symbols - Water */}
    <path d="M48 48 Q48 52 52 52 Q48 52 48 56" fill="none" stroke="#0099ff" strokeWidth="1.5" strokeLinecap="round" />
    {/* Shamanic aura */}
    <circle cx="32" cy="32" r="16" fill="none" stroke="#ff6600" strokeWidth="1" opacity="0.5" />
  </svg>
);