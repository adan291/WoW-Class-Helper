import React from 'react';
import type { WowClass } from '../types.ts';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';
import '../styles/animations.css';

interface ClassCardEnhancedProps {
  wowClass: WowClass;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

/**
 * Enhanced class card with WoW theming and modern animations
 * Features:
 * - Glowing class-colored borders
 * - Lift effect on hover
 * - Shimmer animation
 * - Favorite star indicator
 * - Spec count badge
 */
export const ClassCardEnhanced: React.FC<ClassCardEnhancedProps> = ({
  wowClass,
  onClick,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative group cursor-pointer
        p-4 rounded-lg
        bg-gradient-to-br from-gray-800 to-gray-900
        border-2 border-gray-700
        lift-on-hover smooth-transition
        overflow-hidden
      `}
      style={{
        borderColor: wowClass.color,
        boxShadow: `0 0 15px ${wowClass.color}33`,
      }}
    >
      {/* Shimmer effect background */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Glow border effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `inset 0 0 20px ${wowClass.color}40`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Class Icon with glow */}
        <div
          className="mb-3 p-3 rounded-lg transition-all duration-300 group-hover:scale-110"
          style={{
            background: `${wowClass.color}15`,
            boxShadow: `0 0 20px ${wowClass.color}60`,
          }}
        >
          <ClassIconRenderer
            classId={wowClass.id}
            className="w-12 h-12"
            style={{ color: wowClass.color }}
          />
        </div>

        {/* Class Name */}
        <h3
          className="text-lg font-bold text-center mb-1 transition-all duration-300 group-hover:text-lg"
          style={{ color: wowClass.color }}
        >
          {wowClass.name}
        </h3>

        {/* Spec Count Badge */}
        <div
          className="inline-block px-2 py-1 rounded-full text-xs font-bold mb-2 transition-all duration-300"
          style={{
            background: `${wowClass.color}30`,
            color: wowClass.color,
            border: `1px solid ${wowClass.color}`,
          }}
        >
          {wowClass.specs.length} Specs
        </div>

        {/* Specs Preview */}
        <div className="text-xs text-gray-400 text-center space-y-1 mb-3">
          {wowClass.specs.map((spec) => (
            <div key={spec.id} className="flex items-center justify-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: wowClass.color }}
              />
              <span>{spec.name}</span>
            </div>
          ))}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className="absolute top-2 right-2 p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              background: isFavorite ? `${wowClass.color}40` : 'rgba(255, 255, 255, 0.1)',
              color: isFavorite ? wowClass.color : '#999',
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-5 h-5"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${wowClass.color}20 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default React.memo(ClassCardEnhanced);
