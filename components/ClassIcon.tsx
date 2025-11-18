import React from 'react';
import type { WowClass } from '../types.ts';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';

interface ClassIconProps {
  wowClass: WowClass;
  onClick: () => void;
}

// Fix: Explicitly type as a React Function Component to ensure special props like `key` are handled correctly by TypeScript.
const ClassIcon: React.FC<ClassIconProps> = ({ wowClass, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col items-center p-4 bg-gray-800 bg-opacity-50 rounded-lg border-2 border-gray-700 cursor-pointer transition-all duration-300 hover:border-[var(--class-color)] hover:bg-gray-700/80 transform hover:-translate-y-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_-5px_var(--class-color)]"
      style={{ '--class-color': wowClass.color } as React.CSSProperties}
    >
      <ClassIconRenderer
        classId={wowClass.id}
        className="h-16 w-16 md:h-20 md:w-20 mb-3 transition-transform duration-300 group-hover:scale-110"
        style={{ color: wowClass.color }}
      />
      <span
        className="font-bold text-sm md:text-base text-center transition-colors duration-300 group-hover:drop-shadow-[0_0_3px_var(--class-color)]"
        style={{ color: wowClass.color }}
      >
        {wowClass.name}
      </span>
    </div>
  );
};

export default ClassIcon;