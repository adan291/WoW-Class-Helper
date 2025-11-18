
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { WowClass, Specialization, UserRole } from '../types.ts';
import * as geminiService from '../services/geminiService.ts';
import GuideSection from './GuideSection.tsx';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';

interface ClassHubProps {
  wowClass: WowClass;
  onGoBack: () => void;
  userRole: UserRole;
}

type Tab = 'overview' | 'specs' | 'rotations' | 'addons' | 'dungeons';

interface TabButtonProps {
  tabId: Tab;
  label: string;
  activeTab: Tab;
  onClick: (tabId: Tab) => void;
  activeColor: string;
}

const TabButton = ({ tabId, label, activeTab, onClick, activeColor }: TabButtonProps) => (
  <button
    onClick={() => onClick(tabId)}
    className={`px-4 py-2 text-sm md:text-base font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
      activeTab === tabId
        ? `bg-gray-900/50 border-b-2 text-white`
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
    }`}
    style={{
      borderColor: activeTab === tabId ? activeColor : 'transparent',
    }}
  >
    {label}
  </button>
);

interface SpecButtonProps {
  spec: Specialization;
  isActive: boolean;
  onClick: () => void;
  activeColor: string;
}

// Fix: Explicitly type as a React Function Component to ensure special props like `key` are handled correctly by TypeScript.
const SpecButton: React.FC<SpecButtonProps> = ({ spec, isActive, onClick, activeColor }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all duration-200 transform ${
      isActive ? 'text-gray-900 shadow-lg scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
    }`}
    style={{
      backgroundColor: isActive ? activeColor : undefined,
      boxShadow: isActive ? `0 0 12px -1px ${activeColor}` : 'none',
    }}
  >
    {spec.name}
  </button>
);


const ClassHub = ({ wowClass, onGoBack, userRole }: ClassHubProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeSpec, setActiveSpec] = useState<Specialization>(wowClass.specs[0]);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceUrls, setSourceUrls] = useState('');

  const memoizedContentKey = useMemo(() => {
    return activeTab === 'specs' || activeTab === 'dungeons' || activeTab === 'rotations'
      ? `${activeTab}-${activeSpec.id}`
      : activeTab;
  }, [activeTab, activeSpec]);

  const fetchContent = useCallback(async (urlsOverride?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let newContent = '';
      switch (activeTab) {
        case 'overview':
          newContent = await geminiService.getOverview(wowClass, urlsOverride);
          break;
        case 'specs':
          newContent = await geminiService.getSpecGuide(wowClass, activeSpec, urlsOverride);
          break;
        case 'rotations':
          newContent = await geminiService.getRotationGuide(wowClass, activeSpec, urlsOverride);
          break;
        case 'addons':
          newContent = await geminiService.getAddons(wowClass, urlsOverride);
          break;
        case 'dungeons':
          newContent = await geminiService.getDungeonTips(wowClass, activeSpec, urlsOverride);
          break;
        default:
          break;
      }
      setContent(newContent);
    } catch (err) {
      console.error("Guide generation error:", err);
      setError(
        err instanceof Error 
          ? `Error: ${err.message}. Please try again. If you are using custom Admin Source URLs, please verify they are correct and accessible.` 
          : 'An unexpected error occurred while generating the guide. Please try again.'
      );
      setContent('');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, wowClass, activeSpec]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent, memoizedContentKey]);

  useEffect(() => {
    setActiveSpec(wowClass.specs[0]);
  }, [wowClass]);
  
  const handleRegenerateWithSources = () => {
    fetchContent(sourceUrls);
  };

  const getTabTitle = () => {
    if (activeTab === 'specs') return `${activeSpec.name} ${wowClass.name} Build & Guide`;
    if (activeTab === 'rotations') return `${activeSpec.name} ${wowClass.name} Rotations`;
    if (activeTab === 'dungeons') return `${activeSpec.name} ${wowClass.name} Dungeon Tips`;
    if (activeTab === 'addons') return 'Addons & WeakAuras';
    return 'Class Overview';
  };

  return (
    <div className="animate-fade-in" style={{ '--class-color': wowClass.color } as React.CSSProperties}>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <ClassIconRenderer classId={wowClass.id} className="h-16 w-16 mr-4" style={{ color: wowClass.color }} />
          <h2 className="text-5xl font-black" style={{ color: wowClass.color, textShadow: '0 3px 6px rgba(0,0,0,0.5)' }}>
            {wowClass.name}
          </h2>
        </div>
        <button
          onClick={onGoBack}
          className="px-5 py-2.5 bg-gray-800/50 border-2 border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700/70 hover:border-gray-500 transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Back to Classes
        </button>
      </div>

      {userRole === 'admin' && (
        <div className="mb-6 bg-yellow-900/20 border-2 border-yellow-500/30 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">Admin Tools</h3>
          <p className="text-sm text-yellow-200/80 mb-3">Provide URLs (one per line) for the AI to use as primary sources for generating guides.</p>
          <textarea
            value={sourceUrls}
            onChange={(e) => setSourceUrls(e.target.value)}
            placeholder="e.g., https://www.wowhead.com/guide/classes/mage/arcane/overview"
            className="w-full h-24 p-2 bg-gray-900/50 border border-gray-600 rounded-md text-gray-200 focus:ring-yellow-500 focus:border-yellow-500 transition"
          />
           <button
            onClick={handleRegenerateWithSources}
            className="mt-3 px-4 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors duration-300 flex items-center shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 17H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
            Regenerate Guide
          </button>
        </div>
      )}

      <div className="bg-gray-800 bg-opacity-70 rounded-lg shadow-2xl border border-gray-700" style={{boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 15px -5px var(--class-color)'}}>
        <div className="border-b border-gray-700 px-4 overflow-x-auto">
          <nav className="-mb-px flex space-x-2 md:space-x-4 min-w-max">
            <TabButton tabId="overview" label="Overview" activeTab={activeTab} onClick={setActiveTab} activeColor={wowClass.color} />
            <TabButton tabId="specs" label="Specializations" activeTab={activeTab} onClick={setActiveTab} activeColor={wowClass.color} />
            <TabButton tabId="rotations" label="Rotations" activeTab={activeTab} onClick={setActiveTab} activeColor={wowClass.color} />
            <TabButton tabId="addons" label="Addons & WeakAuras" activeTab={activeTab} onClick={setActiveTab} activeColor={wowClass.color} />
            <TabButton tabId="dungeons" label="Dungeon Tips" activeTab={activeTab} onClick={setActiveTab} activeColor={wowClass.color} />
          </nav>
        </div>
        
        {(activeTab === 'specs' || activeTab === 'dungeons' || activeTab === 'rotations') && (
            <div className="p-4 bg-gray-900 bg-opacity-50 border-b border-gray-700 flex flex-wrap gap-2">
                {wowClass.specs.map(spec => 
                  <SpecButton 
                    key={spec.id} 
                    spec={spec} 
                    isActive={activeSpec.id === spec.id}
                    onClick={() => setActiveSpec(spec)}
                    activeColor={wowClass.color}
                  />
                )}
            </div>
        )}

        <GuideSection
          title={getTabTitle()}
          isLoading={isLoading}
          content={content}
          error={error}
        />
      </div>
    </div>
  );
};

export default ClassHub;
