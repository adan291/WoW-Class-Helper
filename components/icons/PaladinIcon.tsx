import React from 'react';

export const PaladinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Hammer head */}
    <rect
      x="22"
      y="8"
      width="20"
      height="12"
      fill="#c0c0c0"
      stroke="#808080"
      strokeWidth="1"
      rx="1"
    />
    {/* Hammer handle */}
    <rect x="30" y="20" width="4" height="32" fill="#8b7355" stroke="#5c4a37" strokeWidth="0.5" />
    {/* Hammer grip */}
    <circle cx="32" cy="54" r="3" fill="#d4af37" stroke="#b8941f" strokeWidth="0.5" />
    {/* Holy light rays */}
    <path
      d="M32 6 L32 2 M42 14 L45 11 M22 14 L19 11 M48 32 L52 32 M16 32 L12 32"
      stroke="#ffd700"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Holy aura */}
    <circle cx="32" cy="32" r="14" fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.6" />
  </svg>
);
