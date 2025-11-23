import React from 'react';

export const RogueIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Left dagger */}
    <path d="M16 12 L18 40 L14 50 L12 48 Z" fill="#e8e8e8" stroke="#999999" strokeWidth="1" />
    {/* Left dagger crossguard */}
    <rect x="10" y="38" width="8" height="3" fill="#ffd700" stroke="#ccaa00" strokeWidth="0.5" />
    {/* Right dagger */}
    <path d="M48 12 L46 40 L50 50 L52 48 Z" fill="#e8e8e8" stroke="#999999" strokeWidth="1" />
    {/* Right dagger crossguard */}
    <rect x="46" y="38" width="8" height="3" fill="#ffd700" stroke="#ccaa00" strokeWidth="0.5" />
    {/* Shadow/stealth aura */}
    <ellipse
      cx="32"
      cy="35"
      rx="14"
      ry="10"
      fill="none"
      stroke="#666666"
      strokeWidth="1.2"
      opacity="0.7"
    />
    {/* Stealth indicator */}
    <path d="M32 20 L28 28 L36 28 Z" fill="#666666" opacity="0.8" />
  </svg>
);
