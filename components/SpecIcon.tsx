
import React from 'react';
import type { Specialization } from '../types.ts';

interface SpecIconProps {
  spec: Specialization;
  color?: string;
  className?: string;
}

export const SpecIcon: React.FC<SpecIconProps> = ({ spec, color = 'currentColor', className = "w-5 h-5" }) => {
  const role = spec.role;

  if (role === 'Tank') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color }}>
        <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" opacity="0" />
        <path d="M12.75 2.065c5.056 1.005 8.92 5.263 9.228 10.435h-3.765a.75.75 0 01-.749-.694 5.27 5.27 0 00-5.269-5.223.75.75 0 01-.745-.75V2.065zM2.022 12.5c.308-5.172 4.172-9.43 9.228-10.435v3.819a.75.75 0 01-.745.75 5.27 5.27 0 00-5.269 5.223.75.75 0 01-.749.694H2.022zM2.022 14h3.734a.75.75 0 01.749.694 5.27 5.27 0 005.269 5.223.75.75 0 01.745.75v3.819a10.78 10.78 0 01-9.228-10.435v-.051zm13.728 5.917a.75.75 0 01.745-.75 5.27 5.27 0 005.269-5.223.75.75 0 01.749-.694h3.765a10.78 10.78 0 01-9.228 10.435v-3.768z" />
      </svg>
    );
  }

  if (role === 'Healer') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color }}>
        <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
      </svg>
    );
  }

  // Damage
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color }}>
        <path fillRule="evenodd" d="M10.66 15.68a.75.75 0 00-1.272.712l2.828 5.05a.75.75 0 001.348-.244l-2.904-5.518zM13.334 16.05a.75.75 0 00.648-1.304l-4.357-2.18a.75.75 0 00-1.005.292l-1.136 2.03a.75.75 0 00.475 1.09l5.375 1.072zM13.824 11.883a.75.75 0 001.004.291l2.455-1.374a.75.75 0 00.291-1.005l-1.374-2.454a.75.75 0 00-1.004-.291l-2.455 1.374a.75.75 0 00-.291 1.005l1.374 2.454z" clipRule="evenodd" />
        <path d="M9.773 9.17l1.514-2.704a2.25 2.25 0 013.012-.872l2.455 1.374a2.25 2.25 0 01.872 3.012l-1.514 2.704a.75.75 0 00-.128.77l2.904 5.519a2.25 2.25 0 01-2.645 3.15l-5.05-2.828a2.25 2.25 0 01-1.044-1.564l-1.072-5.375a.75.75 0 00-.494-.59L4.052 10.25a2.25 2.25 0 01.872-3.012l2.455-1.374a2.25 2.25 0 013.012.872l.55.984a.75.75 0 001.062.132l.55-.31a.75.75 0 00.132-1.062l-2.913-5.202z" />
    </svg>
  );
};
