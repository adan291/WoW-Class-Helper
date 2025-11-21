import React from 'react';
import type { WowClass } from '../types.ts';

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
    <div
      onClick={onClick}
      className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
    >
      <div
        className="p-4 rounded-lg border-2 transition-all duration-300 h-full flex flex-col items-center justify-center text-center hover:shadow-lg"
        style={{
          borderColor: wowClass.color,
          backgroundColor: `${wowClass.color}15`,
        }}
      >
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
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${wowClass.color}30` }}
        >
          {wowClass.icon}
        </div>

        {/* Class Name */}
        <h3
          className="text-lg font-bold mb-2 transition-colors"
          style={{ color: wowClass.color }}
        >
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
        <p className="text-xs text-gray-400 line-clamp-2">
          {wowClass.description}
        </p>
      </div>
    </div>
  );
};

export default ClassCard;
