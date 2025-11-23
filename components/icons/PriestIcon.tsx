import React from 'react';

export const PriestIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Holy symbol - Cross */}
    <rect x="30" y="10" width="4" height="44" fill="#ffeb3b" stroke="#ffd700" strokeWidth="1" />
    <rect x="16" y="26" width="32" height="4" fill="#ffeb3b" stroke="#ffd700" strokeWidth="1" />
    {/* Cross outline for depth */}
    <rect
      x="29"
      y="9"
      width="6"
      height="46"
      fill="none"
      stroke="#ffffff"
      strokeWidth="0.5"
      opacity="0.6"
    />
    <rect
      x="15"
      y="25"
      width="34"
      height="6"
      fill="none"
      stroke="#ffffff"
      strokeWidth="0.5"
      opacity="0.6"
    />
    {/* Light rays */}
    <path
      d="M20 16 L18 12 M44 16 L46 12 M20 48 L18 52 M44 48 L46 52"
      stroke="#ffd700"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Divine aura */}
    <circle cx="32" cy="32" r="12" fill="none" stroke="#ffd700" strokeWidth="1.5" opacity="0.7" />
    <circle cx="32" cy="32" r="16" fill="none" stroke="#ffeb3b" strokeWidth="0.8" opacity="0.4" />
  </svg>
);
