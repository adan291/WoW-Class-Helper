import React from 'react';
import '../styles/animations.css';

interface ContentFrameEnhancedProps {
  children: React.ReactNode;
  classColor?: string;
  title?: string;
}

/**
 * Enhanced content frame with WoW theming
 * Features:
 * - WoW-style borders with corner decorations
 * - Glowing edges matching class color
 * - Subtle background texture
 * - Smooth animations on load
 */
export const ContentFrameEnhanced: React.FC<ContentFrameEnhancedProps> = ({
  children,
  classColor = '#FFD700',
  title,
}) => {
  return (
    <div className="relative scale-in">
      {/* Outer glow effect */}
      <div
        className="absolute inset-0 rounded-lg blur-xl opacity-30 -z-10"
        style={{
          background: classColor,
        }}
      />

      {/* Main frame */}
      <div
        className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border-2 overflow-hidden backdrop-blur-sm"
        style={{
          borderColor: classColor,
          boxShadow: `
            0 0 20px ${classColor}40,
            inset 0 0 20px ${classColor}10,
            0 0 40px ${classColor}20
          `,
        }}
      >
        {/* Corner decorations - Top Left */}
        <div
          className="absolute top-0 left-0 w-8 h-8 opacity-60"
          style={{
            background: `linear-gradient(135deg, ${classColor}60 0%, transparent 100%)`,
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          }}
        />

        {/* Corner decorations - Top Right */}
        <div
          className="absolute top-0 right-0 w-8 h-8 opacity-60"
          style={{
            background: `linear-gradient(225deg, ${classColor}60 0%, transparent 100%)`,
            clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          }}
        />

        {/* Corner decorations - Bottom Left */}
        <div
          className="absolute bottom-0 left-0 w-8 h-8 opacity-60"
          style={{
            background: `linear-gradient(45deg, ${classColor}60 0%, transparent 100%)`,
            clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
          }}
        />

        {/* Corner decorations - Bottom Right */}
        <div
          className="absolute bottom-0 right-0 w-8 h-8 opacity-60"
          style={{
            background: `linear-gradient(315deg, ${classColor}60 0%, transparent 100%)`,
            clipPath: 'polygon(100% 100%, 0 100%, 100% 0)',
          }}
        />

        {/* Top border glow */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${classColor}, transparent)`,
            boxShadow: `0 0 10px ${classColor}`,
          }}
        />

        {/* Bottom border glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${classColor}, transparent)`,
            boxShadow: `0 0 10px ${classColor}`,
          }}
        />

        {/* Left border glow */}
        <div
          className="absolute top-0 bottom-0 left-0 w-1 opacity-30"
          style={{
            background: `linear-gradient(180deg, transparent, ${classColor}, transparent)`,
            boxShadow: `0 0 10px ${classColor}`,
          }}
        />

        {/* Right border glow */}
        <div
          className="absolute top-0 bottom-0 right-0 w-1 opacity-30"
          style={{
            background: `linear-gradient(180deg, transparent, ${classColor}, transparent)`,
            boxShadow: `0 0 10px ${classColor}`,
          }}
        />

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                ${classColor},
                ${classColor} 10px,
                transparent 10px,
                transparent 20px
              )
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {title && (
            <div
              className="px-6 py-4 border-b-2 flex items-center gap-3"
              style={{
                borderColor: classColor,
                background: `${classColor}10`,
              }}
            >
              <div
                className="w-1 h-6 rounded-full"
                style={{ background: classColor }}
              />
              <h3
                className="text-lg font-bold"
                style={{ color: classColor }}
              >
                {title}
              </h3>
            </div>
          )}
          <div className="p-6 md:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ContentFrameEnhanced);
