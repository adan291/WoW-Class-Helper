import React from 'react';
import type { WowClass } from '../types.ts';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';
import '../styles/animations.css';

interface HeroSectionEnhancedProps {
  wowClass: WowClass;
  onGoBack: () => void;
}

/**
 * Enhanced hero section with WoW theming
 * Features:
 * - Large class icon with glow
 * - Class name with fantasy styling
 * - Animated background
 * - Return button with effects
 */
export const HeroSectionEnhanced: React.FC<HeroSectionEnhancedProps> = ({
  wowClass,
  onGoBack,
}) => {
  return (
    <div
      className="relative mb-6 overflow-hidden rounded-lg"
      style={{
        background: `linear-gradient(135deg, ${wowClass.color}15 0%, ${wowClass.color}05 100%)`,
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${wowClass.color} 0%, transparent 70%)`,
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-10" style={{
        background: `radial-gradient(circle, ${wowClass.color}, transparent)`,
        filter: 'blur(40px)',
      }} />
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10" style={{
        background: `radial-gradient(circle, ${wowClass.color}, transparent)`,
        filter: 'blur(40px)',
      }} />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left side - Icon and name */}
        <div className="flex items-center gap-6 flex-1">
          {/* Class Icon with glow */}
          <div className="relative group">
            {/* Outer glow */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: wowClass.color,
                width: '120px',
                height: '120px',
                left: '-10px',
                top: '-10px',
              }}
            />

            {/* Icon container */}
            <div
              className="relative w-24 h-24 md:w-32 md:h-32 p-4 rounded-lg transition-all duration-300 group-hover:scale-110"
              style={{
                background: `${wowClass.color}20`,
                border: `2px solid ${wowClass.color}`,
                boxShadow: `0 0 30px ${wowClass.color}60, inset 0 0 20px ${wowClass.color}20`,
              }}
            >
              <ClassIconRenderer
                classId={wowClass.id}
                className="w-full h-full"
                style={{ color: wowClass.color }}
              />
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-lg shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Class name and info */}
          <div className="flex-1">
            <h2
              className="text-4xl md:text-5xl font-black tracking-tight uppercase transition-all duration-300"
              style={{
                color: wowClass.color,
                textShadow: `0 0 20px ${wowClass.color}60, 0 2px 4px rgba(0,0,0,0.8)`,
              }}
            >
              {wowClass.name}
            </h2>

            {/* Specs count */}
            <div className="mt-3 flex gap-2 flex-wrap">
              {wowClass.specs.map((spec) => (
                <div
                  key={spec.id}
                  className="px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 hover:scale-105"
                  style={{
                    background: `${wowClass.color}20`,
                    color: wowClass.color,
                    border: `1px solid ${wowClass.color}`,
                    boxShadow: `0 0 10px ${wowClass.color}40`,
                  }}
                >
                  {spec.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Return button */}
        <button
          onClick={onGoBack}
          className="px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 lift-on-hover flex items-center gap-2 group"
          style={{
            background: `${wowClass.color}20`,
            color: wowClass.color,
            border: `2px solid ${wowClass.color}`,
            boxShadow: `0 0 15px ${wowClass.color}40`,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Return
        </button>
      </div>

      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
        style={{
          background: `linear-gradient(90deg, transparent, ${wowClass.color}, transparent)`,
          boxShadow: `0 0 15px ${wowClass.color}`,
        }}
      />
    </div>
  );
};

export default React.memo(HeroSectionEnhanced);
