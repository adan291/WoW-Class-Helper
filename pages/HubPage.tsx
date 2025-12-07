import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { WowIcon } from '../components/icons/WowIcon';
import { CanAccess } from '../components/CanAccess';
import '../styles/animations.css';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  features: string[];
}

const TOOLS: ToolCard[] = [
  {
    id: 'class-helper',
    title: 'Class Helper',
    description:
      'AI-powered class guides, talent builds, and rotation tips for all WoW classes and specs.',
    icon: '⚔️',
    path: '/class-helper',
    color: '#FFD700',
    features: ['Class Guides', 'Talent Builds', 'Rotation Tips', 'Dungeon Strategies'],
  },
  {
    id: 'log-analyzer',
    title: 'Log Analyzer',
    description:
      'Upload combat logs to analyze boss mechanics, generate strategies, and practice encounters.',
    icon: '📊',
    path: '/log-analyzer',
    color: '#F97316',
    features: ['Combat Log Parsing', 'AI Strategy', 'Timeline View', 'Practice Mode'],
  },
];

export const HubPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className="min-h-screen bg-gray-950 text-gray-200 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')",
      }}
    >
      <div className="min-h-screen bg-[#020617]/90 backdrop-blur-sm">
        {/* Header */}
        <header
          className="py-4 px-6 flex items-center justify-between border-b border-white/10 shadow-2xl glass-effect"
          style={{ borderColor: 'rgba(255, 215, 0, 0.2)' }}
        >
          <div className="flex items-center gap-4">
            <WowIcon className="h-10 w-10 text-yellow-400" />
            <div>
              <h1
                className="text-3xl font-black tracking-wider uppercase"
                style={{
                  color: '#FFD700',
                  textShadow: '0 0 10px #FFD70040, 0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                WoW AI Hub
              </h1>
              <p className="text-xs text-yellow-500/80 font-mono tracking-widest uppercase">
                Your Ultimate WoW Companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500 hover:scale-105 active:scale-95"
                >
                  👤 Profile
                </Link>
                <CanAccess permission="view_admin_dashboard">
                  <Link
                    to="/admin"
                    className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(255,215,0,0.3)]"
                  >
                    ⚙️ Admin
                  </Link>
                </CanAccess>
              </>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(255,215,0,0.3)]"
              >
                Login
              </Link>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Tool</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful AI-driven tools to enhance your World of Warcraft experience. Select a tool
              below to get started.
            </p>
          </div>

          {/* Tool Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {TOOLS.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className="group relative bg-gray-900/80 border border-gray-700 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] hover:scale-[1.02]"
              >
                {/* Glow Effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${tool.color}10 0%, transparent 70%)`,
                  }}
                />

                <div className="relative z-10">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                      style={{
                        backgroundColor: `${tool.color}20`,
                        border: `2px solid ${tool.color}40`,
                      }}
                    >
                      {tool.icon}
                    </div>
                    <div>
                      <h3
                        className="text-2xl font-bold group-hover:text-yellow-400 transition-colors"
                        style={{ color: tool.color }}
                      >
                        {tool.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 mb-6">{tool.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1.5 bg-gray-800/80 text-gray-300 text-sm rounded-full border border-gray-600 group-hover:border-yellow-500/30 group-hover:bg-gray-700/80 transition-all duration-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Arrow */}
                  <div className="absolute bottom-8 right-8 text-gray-600 group-hover:text-yellow-400 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Coming Soon Section */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">More tools coming soon...</p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="px-4 py-2 bg-gray-800/50 text-gray-500 rounded-lg border border-gray-700 border-dashed">
                🎯 M+ Timer
              </div>
              <div className="px-4 py-2 bg-gray-800/50 text-gray-500 rounded-lg border border-gray-700 border-dashed">
                📈 Raid Planner
              </div>
              <div className="px-4 py-2 bg-gray-800/50 text-gray-500 rounded-lg border border-gray-700 border-dashed">
                🏆 Achievement Tracker
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
