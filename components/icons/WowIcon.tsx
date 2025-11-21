import React from 'react';

export const WowIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" {...props}>
    {/* Outer circle border - gold */}
    <circle cx="64" cy="64" r="62" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    
    {/* Inner circle - dark background */}
    <circle cx="64" cy="64" r="58" fill="currentColor" opacity="0.1" />
    
    {/* Left sword */}
    <path d="M32 28 L36 64 L32 100 L28 64 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
    <rect x="20" y="62" width="24" height="4" fill="currentColor" stroke="currentColor" strokeWidth="1" opacity="0.8" />
    
    {/* Right sword */}
    <path d="M96 28 L92 64 L96 100 L100 64 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
    <rect x="84" y="62" width="24" height="4" fill="currentColor" stroke="currentColor" strokeWidth="1" opacity="0.8" />
    
    {/* Central shield */}
    <path d="M64 20 L80 32 L80 56 Q80 72 64 80 Q48 72 48 56 L48 32 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
    
    {/* Shield emblem - W for WoW */}
    <text x="64" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor" opacity="0.6" fontFamily="serif">W</text>
    
    {/* Decorative corner elements */}
    <path d="M20 20 L26 24 M108 20 L102 24 M20 108 L26 104 M108 108 L102 104" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    
    {/* Glow effect */}
    <circle cx="64" cy="64" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
  </svg>
);
