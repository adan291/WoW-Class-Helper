
import React from 'react';

export const MageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Staff */}
    <rect x="30" y="8" width="4" height="48" fill="#8b7355" stroke="#5c4a37" strokeWidth="0.5" />
    {/* Top orb */}
    <circle cx="32" cy="12" r="5" fill="#0099ff" stroke="#0066cc" strokeWidth="1" />
    {/* Magic sparkles around orb */}
    <path d="M32 4 L34 8 M32 4 L30 8 M40 12 L36 12 M24 12 L28 12" stroke="#0099ff" strokeWidth="1.5" strokeLinecap="round" />
    {/* Bottom handle */}
    <circle cx="32" cy="58" r="3" fill="#d4af37" stroke="#b8941f" strokeWidth="0.5" />
    {/* Magic aura */}
    <circle cx="32" cy="32" r="12" fill="none" stroke="#0099ff" strokeWidth="1" opacity="0.6" />
  </svg>
);