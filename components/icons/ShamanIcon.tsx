
import React from 'react';

export const ShamanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Totem pole - base */}
    <rect x="28" y="40" width="8" height="18" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    {/* Totem pole - middle */}
    <rect x="26" y="28" width="12" height="12" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    {/* Totem pole - top */}
    <circle cx="32" cy="18" r="6" fill="currentColor" stroke="currentColor" strokeWidth="1" />
    {/* Elemental symbols - Earth */}
    <path d="M16 48 L20 52 L16 56 L12 52 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    {/* Elemental symbols - Water */}
    <path d="M48 48 Q48 52 52 52 Q48 52 48 56" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Shamanic aura */}
    <circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
  </svg>
);