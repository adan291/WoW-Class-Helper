import React from 'react';
import type { WowClass } from '../types.ts';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';

interface ClassCardProps {
  wowClass: WowClass;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  wowClass,
  onClick,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div onClick={onClick} className="relative group cursor-pointer lift-on-hover h-full">
      <div
        className="p-5 rounded-xl border border-white/10 transition-all duration-300 h-full flex flex-col items-center justify-center text-center hover:shadow-2xl hover:border-opacity-50 relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(8px)',
          borderColor: `${wowClass.color}40`,
        }}
      >
        {/* Glow effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${wowClass.color}20 0%, transparent 70%)`,
          }}
        />
        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 text-xl transition-transform hover:scale-125"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>

        {/* Class Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
          style={{
            backgroundColor: `${wowClass.color}40`,
            border: `2px solid ${wowClass.color}60`,
          }}
        >
          <ClassIconRenderer classId={wowClass.id} className="w-12 h-12" />
        </div>

        {/* Class Name */}
        <h3 className="text-lg font-bold mb-2 transition-colors" style={{ color: wowClass.color }}>
          {wowClass.name}
        </h3>

        {/* Specs */}
        <div className="flex flex-wrap gap-1 justify-center mb-2">
          {wowClass.specs.map((spec) => (
            <span
              key={spec.id}
              className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300"
            >
              {spec.name}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{wowClass.description}</p>
      </div>
    </div>
  );
};

export default ClassCard;
