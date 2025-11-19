import React from 'react';
import '../styles/animations.css';

export interface TabDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabNavigationEnhancedProps {
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  classColor?: string;
}

/**
 * Enhanced tab navigation with WoW theming
 * Features:
 * - Animated underline
 * - Glow effects
 * - Smooth transitions
 * - Icon + text combination
 */
export const TabNavigationEnhanced: React.FC<TabNavigationEnhancedProps> = ({
  tabs,
  activeTab,
  onTabChange,
  classColor = '#FFD700',
}) => {
  return (
    <div className="border-b-2 px-4 overflow-x-auto bg-gray-900/90 smooth-transition" style={{ borderColor: classColor }}>
      <nav className="-mb-px flex space-x-1 min-w-max relative">
        {/* Animated background glow */}
        <div
          className="absolute bottom-0 h-1 transition-all duration-300 ease-out"
          style={{
            background: classColor,
            filter: `drop-shadow(0 0 10px ${classColor}80)`,
            width: '0px',
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative group
                flex items-center px-4 py-3 text-sm md:text-base font-bold
                rounded-t-lg transition-all duration-200
                focus:outline-none
                ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }
              `}
            >
              {/* Icon */}
              <span
                className={`mr-2 transition-all duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
                style={{
                  color: isActive ? classColor : 'inherit',
                }}
              >
                {tab.icon}
              </span>

              {/* Label */}
              <span className="relative">
                {tab.label}

                {/* Animated underline */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                    style={{
                      background: classColor,
                      boxShadow: `0 0 10px ${classColor}`,
                    }}
                  />
                )}
              </span>

              {/* Hover glow effect */}
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${classColor}10 0%, transparent 70%)`,
                  }}
                />
              )}

              {/* Active glow effect */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-t-lg opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 -10px 20px -10px ${classColor}40, 0 0 15px ${classColor}30`,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default React.memo(TabNavigationEnhanced);
