import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import AbilitiesTab from './components/AbilitiesTab';
import TimelineTab from './components/TimelineTab';
import StrategyTab from './components/StrategyTab';
import MiniGameTab from './components/MiniGameTab';
import { LogSummary } from './types';
import { useAuth } from '../../hooks/useAuth';
import { CanAccess } from '../../components/CanAccess';
import '../../styles/animations.css';

enum Tab {
  UPLOAD = 'Upload',
  ABILITIES = 'Abilities',
  TIMELINE = 'Timeline',
  STRATEGY = 'AI Strategy',
  GAME = 'Practice',
}

interface NavButtonProps {
  tab: Tab;
  icon: string;
  activeTab: Tab;
  disabled: boolean;
  onClick: (tab: Tab) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ tab, icon, activeTab, disabled, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
      activeTab === tab
        ? 'bg-yellow-500 text-black font-bold shadow-lg'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
  >
    <span>{icon}</span>
    <span>{tab}</span>
  </button>
);

const LogAnalyzerApp: React.FC = () => {
  const [data, setData] = useState<LogSummary | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.UPLOAD);
  const { isAuthenticated } = useAuth();

  const handleDataLoaded = (loadedData: LogSummary) => {
    setData(loadedData);
    setActiveTab(Tab.ABILITIES);
  };

  const handleTabClick = (tab: Tab) => {
    if (data) setActiveTab(tab);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-950 text-gray-100 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')",
      }}
    >
      <div className="min-h-screen flex flex-col bg-[#020617]/90 backdrop-blur-sm">
        {/* Top Bar */}
        <div className="bg-gray-900/80 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-700 rounded rotate-45 flex items-center justify-center border border-orange-500">
                <span className="text-black -rotate-45">⚔️</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                Azeroth<span className="text-yellow-500">AI</span> Analyst
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {data ? (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    Encounter
                  </p>
                  <p className="text-sm font-bold text-white leading-tight">{data.encounterName}</p>
                </div>
                <div className="h-8 w-px bg-gray-800" />
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    Duration
                  </p>
                  <p className="text-sm font-mono text-yellow-500 leading-tight">
                    {(data.duration / 60).toFixed(1)}m
                  </p>
                </div>
                <div className="h-8 w-px bg-gray-800" />
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    Events
                  </p>
                  <p className="text-sm font-mono text-gray-300 leading-tight">
                    {data.rawLineCount.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600 text-sm italic">
                <span>📊</span>
                <span>Waiting for combat log...</span>
              </div>
            )}

            <div className="flex items-center gap-3 ml-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-600 text-sm"
                  >
                    👤 Profile
                  </Link>
                  <CanAccess permission="view_admin_dashboard">
                    <Link
                      to="/admin"
                      className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
                    >
                      ⚙️ Admin
                    </Link>
                  </CanAccess>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="bg-gray-900/60 border-b border-gray-700 px-6 py-2 flex items-center gap-1 sticky top-0 z-40 backdrop-blur-sm">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm font-medium mr-2"
          >
            <span>🏠</span>
            <span>Hub</span>
          </Link>
          <div className="w-px h-5 bg-gray-700 mx-2" />
          <NavButton
            tab={Tab.UPLOAD}
            icon="📄"
            activeTab={activeTab}
            disabled={false}
            onClick={handleTabClick}
          />
          <NavButton
            tab={Tab.ABILITIES}
            icon="⚔️"
            activeTab={activeTab}
            disabled={!data}
            onClick={handleTabClick}
          />
          <NavButton
            tab={Tab.TIMELINE}
            icon="⏱️"
            activeTab={activeTab}
            disabled={!data}
            onClick={handleTabClick}
          />
          <NavButton
            tab={Tab.STRATEGY}
            icon="🧠"
            activeTab={activeTab}
            disabled={!data}
            onClick={handleTabClick}
          />
          <NavButton
            tab={Tab.GAME}
            icon="🎮"
            activeTab={activeTab}
            disabled={!data}
            onClick={handleTabClick}
          />
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-hidden relative">
          <div className="h-full max-w-7xl mx-auto">
            {!data || activeTab === Tab.UPLOAD ? (
              <FileUpload onDataLoaded={handleDataLoaded} />
            ) : (
              <div className="h-full">
                {activeTab === Tab.ABILITIES && <AbilitiesTab data={data} />}
                {activeTab === Tab.TIMELINE && <TimelineTab data={data} />}
                {activeTab === Tab.STRATEGY && <StrategyTab data={data} />}
                {activeTab === Tab.GAME && <MiniGameTab data={data} />}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LogAnalyzerApp;
