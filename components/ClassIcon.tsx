
import React from 'react';
import type { WowClass } from '../types.ts';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';

interface ClassIconProps {
  wowClass: WowClass;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

const ClassIcon: React.FC<ClassIconProps> = ({ wowClass, onClick, isFavorite, onToggleFavorite }) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col items-center p-4 bg-gray-800 rounded-md border-2 border-gray-600 cursor-pointer transition-all duration-300 hover:border-[var(--class-color)] hover:bg-gray-800 transform hover:-translate-y-1 shadow-lg hover:shadow-[0_0_20px_-5px_var(--class-color)] overflow-hidden"
      style={{ '--class-color': wowClass.color } as React.CSSProperties}
    >
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 z-20 text-gray-500 hover:text-yellow-400 transition-colors"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isFavorite ? "currentColor" : "none"} 
            stroke="currentColor" 
            className={`w-5 h-5 ${isFavorite ? "text-yellow-400" : ""}`}
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-[var(--class-color)] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      
      {/* Inner Border Decoration */}
      <div className="absolute inset-1 border border-white/5 rounded-sm pointer-events-none"></div>

      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 mb-3 p-2 rounded-full bg-black/30 ring-1 ring-white/10">
        <ClassIconRenderer
          classId={wowClass.id}
          className="h-14 w-14 md:h-16 md:w-16"
          style={{ color: wowClass.color }}
        />
      </div>
      <span
        className="relative z-10 font-bold text-sm md:text-base text-center uppercase tracking-wider transition-colors duration-300 text-gray-300 group-hover:text-white group-hover:drop-shadow-[0_0_5px_var(--class-color)]"
      >
        {wowClass.name}
      </span>
    </div>
  );
};

export default ClassIcon;
