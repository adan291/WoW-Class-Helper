import React from 'react';
import type { Specialization, WowClass } from '../types.ts';
import { SpecIcon } from './SpecIcon.tsx';
import '../styles/animations.css';

interface SpecCardEnhancedProps {
  spec: Specialization;
  wowClass: WowClass;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Enhanced specialization card with WoW theming
 * Features:
 * - Role indicator with icon
 * - Class-colored glow effects
 * - Smooth hover animations
 * - Active state styling
 */
export const SpecCardEnhanced: React.FC<SpecCardEnhancedProps> = ({
  spec,
  wowClass,
  isActive = false,
  onClick,
}) => {
  // Role icons and colors
  const roleConfig = {
    Tank: {
      icon: '🛡️',
      color: '#4A90E2',
      label: 'Tank',
    },
    Healer: {
      icon: '✨',
      color: '#50C878',
      label: 'Healer',
    },
    Damage: {
      icon: '⚔️',
      color: '#FF6B6B',
      label: 'DPS',
    },
    Support: {
      icon: '⭐',
      color: '#FFD700',
      label: 'Support',
    },
  };

  const role = roleConfig[spec.role as keyof typeof roleConfig] || roleConfig.Damage;

  return (
    <button
      onClick={onClick}
      className={`
        relative group
        px-4 py-3 rounded-lg
        transition-all duration-300
        lift-on-hover
        overflow-hidden
        border-2
        ${
          isActive
            ? 'border-opacity-100 shadow-lg'
            : 'border-opacity-50 hover:border-opacity-100'
        }
      `}
      style={{
        borderColor: wowClass.color,
        background: isActive
          ? `linear-gradient(135deg, ${wowClass.color}20 0%, ${wowClass.color}10 100%)`
          : `linear-gradient(135deg, ${wowClass.color}10 0%, ${wowClass.color}05 100%)`,
        boxShadow: isActive
          ? `0 0 20px ${wowClass.color}60, inset 0 0 10px ${wowClass.color}20`
          : `0 0 10px ${wowClass.color}30`,
      }}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Glow background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${wowClass.color}15 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Spec Icon */}
        <div
          className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
          style={{
            background: `${wowClass.color}20`,
            boxShadow: `0 0 10px ${wowClass.color}40`,
          }}
        >
          <div style={{ color: wowClass.color }}>
            <SpecIcon spec={spec} className="w-5 h-5" />
          </div>
        </div>

        {/* Spec Info */}
        <div className="flex-1 text-left">
          <div
            className="font-bold text-sm transition-all duration-300"
            style={{ color: wowClass.color }}
          >
            {spec.name}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs" style={{ color: role.color }}>
              {role.icon} {role.label}
            </span>
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: wowClass.color }}
          />
        )}
      </div>

      {/* Border glow effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 15px ${wowClass.color}30`,
        }}
      />
    </button>
  );
};

export default React.memo(SpecCardEnhanced);
