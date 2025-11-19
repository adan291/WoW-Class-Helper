
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { WowClass, Specialization, UserRole, Dungeon } from '../types.ts';
import { DUNGEONS, EXPANSIONS } from '../constants.ts';
import * as geminiService from '../services/geminiService.ts';
import { cacheService } from '../services/cacheService.ts';
import GuideSection from './GuideSection.tsx';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';
import { SpecIcon } from './SpecIcon.tsx';

interface ClassHubProps {
  wowClass: WowClass;
  onGoBack: () => void;
  userRole: UserRole;
}

type TabId = 'overview' | 'specs' | 'rotations' | 'addons' | 'dungeons';

interface TabDefinition {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// SVG Icons for Tabs
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.25 4.533A9.707 9.707 9.707 0 006 3.75a9.753 9.753 0 00-3.25.557.75.75 0 00-.5.716v14.477a.75.75 0 00.5.716 9.75 9.75 0 013.25.557 9.75 9.75 0 013.25-.557.75.75 0 01.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75V4.533zM12.75 4.533v14.477a.75.75 0 00.75-.75v-.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 00.5.716 9.75 9.75 0 003.25.557 9.75 9.75 0 003.25-.557.75.75 0 00.5-.716V4.282a.75.75 0 00-.5-.716 9.753 9.753 0 00-3.25-.557 9.707 9.707 0 00-5.25.783z" />
  </svg>
);

const SwordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10.66 15.68a.75.75 0 00-1.272.712l2.828 5.05a.75.75 0 001.348-.244l-2.904-5.518zM13.334 16.05a.75.75 0 00.648-1.304l-4.357-2.18a.75.75 0 00-1.005.292l-1.136 2.03a.75.75 0 00.475 1.09l5.375 1.072zM13.824 11.883a.75.75 0 001.004.291l2.455-1.374a.75.75 0 00.291-1.005l-1.374-2.454a.75.75 0 00-1.004-.291l-2.455 1.374a.75.75 0 00-.291 1.005l1.374 2.454z" clipRule="evenodd" />
    <path d="M9.773 9.17l1.514-2.704a2.25 2.25 0 013.012-.872l2.455 1.374a2.25 2.25 0 01.872 3.012l-1.514 2.704a.75.75 0 00-.128.77l2.904 5.519a2.25 2.25 0 01-2.645 3.15l-5.05-2.828a2.25 2.25 0 01-1.044-1.564l-1.072-5.375a.75.75 0 00-.494-.59L4.052 10.25a2.25 2.25 0 01.872-3.012l2.455-1.374a2.25 2.25 0 013.012.872l.55.984a.75.75 0 001.062.132l.55-.31a.75.75 0 00.132-1.062l-2.913-5.202z" />
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
    <path d="M10.5 7.5a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
);

const PuzzleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06 5.25 5.25 0 001.674 3.905.75.75 0 01-.53 1.28H8.25a.75.75 0 01-.75-.75V5.56a2.25 2.25 0 00-2.25-2.25H3.75a.75.75 0 00-.75.75v4.28a2.25 2.25 0 00-2.25 2.25v3.38a.75.75 0 00.75.75h3.905a.75.75 0 011.28.53 5.25 5.25 0 003.905 1.674.75.75 0 011.06 0 5.25 5.25 0 003.905-1.674.75.75 0 011.28-.53h3.905a.75.75 0 00.75-.75v-3.38a2.25 2.25 0 00-2.25-2.25v-4.28a.75.75 0 00-.75-.75h-1.5a2.25 2.25 0 00-2.25 2.25v3.905a.75.75 0 01-.75.75h-1.28a.75.75 0 01-.53-1.28 5.25 5.25 0 00-1.674-3.905.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const SkullIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" />
  </svg>
);

const TAB_DEFINITIONS: TabDefinition[] = [
    { id: 'overview', label: 'Overview', icon: <BookIcon /> },
    { id: 'specs', label: 'Builds', icon: <SwordIcon /> },
    { id: 'rotations', label: 'Rotations', icon: <TargetIcon /> },
    { id: 'addons', label: 'Addons', icon: <PuzzleIcon /> },
    { id: 'dungeons', label: 'Dungeons', icon: <SkullIcon /> },
];

const ClassHub = ({ wowClass, onGoBack, userRole }: ClassHubProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activeSpec, setActiveSpec] = useState<Specialization>(wowClass.specs[0]);
  // Default to "The War Within" to show current expansion content first
  const [selectedExpansion, setSelectedExpansion] = useState<string>('The War Within');
  const [showAdminConfig, setShowAdminConfig] = useState(false);
  
  // Filter dungeons based on expansion and sort alphabetically by name
  const filteredDungeons = useMemo(() => {
    const dungeons = selectedExpansion === 'All' 
      ? DUNGEONS 
      : DUNGEONS.filter(d => d.expansion === selectedExpansion);
    return dungeons.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedExpansion]);

  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon>(filteredDungeons[0] || DUNGEONS[0]);
  
  // Update selected dungeon when filter changes or dungeons load
  useEffect(() => {
    if (filteredDungeons.length > 0) {
        // If the currently selected dungeon is not in the new list, select the first one
        const exists = filteredDungeons.find(d => d.name === selectedDungeon.name);
        if (!exists) {
            setSelectedDungeon(filteredDungeons[0]);
        }
    }
  }, [filteredDungeons, selectedDungeon]);

  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceUrls, setSourceUrls] = useState('');

  const memoizedContentKey = useMemo(() => {
    if (activeTab === 'dungeons') {
        return `${activeTab}-${activeSpec.id}-${selectedDungeon.name}`;
    }
    return activeTab === 'specs' || activeTab === 'rotations'
      ? `${activeTab}-${activeSpec.id}`
      : activeTab;
  }, [activeTab, activeSpec, selectedDungeon]);

  const fetchContent = useCallback(async (urlsOverride?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs
      if (!wowClass || !wowClass.id) {
        throw new Error('Invalid class selected');
      }
      if (!activeSpec || !activeSpec.id) {
        throw new Error('Invalid specialization selected');
      }
      if (activeTab === 'dungeons' && (!selectedDungeon || !selectedDungeon.name)) {
        throw new Error('Invalid dungeon selected');
      }

      // Check cache first (only if no custom URLs override)
      if (!urlsOverride) {
        const cachedContent = cacheService.get<string>(memoizedContentKey);
        if (cachedContent) {
          setContent(cachedContent);
          setIsLoading(false);
          return;
        }
      }

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
          newContent = await geminiService.getDungeonTips(wowClass, activeSpec, selectedDungeon.name, urlsOverride);
          break;
        default:
          throw new Error(`Unknown tab: ${activeTab}`);
      }

      // Validate content
      if (!newContent || typeof newContent !== 'string') {
        throw new Error('Invalid content received from API');
      }

      // Cache the content (1 hour TTL)
      cacheService.set(memoizedContentKey, newContent);

      setContent(newContent);
    } catch (err) {
      console.error("Guide generation error:", err);
      
      let errorMessage = 'An unexpected error occurred while generating the guide.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Provide specific guidance for common errors
        if (err.message.includes('API')) {
          errorMessage += ' Please check your API key configuration.';
        }
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage += ' Please check your internet connection.';
        }
      }
      
      // Add admin-specific guidance
      if (userRole === 'admin' && sourceUrls) {
        errorMessage += ' If you are using custom Admin Source URLs, please verify they are correct and accessible.';
      }
      
      setError(errorMessage);
      setContent('');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, wowClass, activeSpec, selectedDungeon, userRole, sourceUrls, memoizedContentKey]);

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
    if (activeTab === 'dungeons') return `${activeSpec.name} Tips for ${selectedDungeon.name}`;
    if (activeTab === 'addons') return 'Addons & WeakAuras';
    return 'Class Overview';
  };
  
  const getTabIcon = () => {
     if (activeTab === 'specs' || activeTab === 'rotations' || activeTab === 'dungeons') {
         return <SpecIcon spec={activeSpec} className="w-8 h-8 text-[var(--class-color)]" />;
     }
     if (activeTab === 'overview') return <ClassIconRenderer classId={wowClass.id} className="w-8 h-8 text-[var(--class-color)]" />;
     return null;
  };

  return (
    <div className="animate-fade-in" style={{ '--class-color': wowClass.color } as React.CSSProperties}>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-md opacity-70" style={{ backgroundColor: wowClass.color }}></div>
            <ClassIconRenderer classId={wowClass.id} className="relative h-20 w-20 mr-6 drop-shadow-lg" style={{ color: '#fff' }} />
          </div>
          <h2 className="text-5xl font-black tracking-tight uppercase" style={{ color: wowClass.color, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {wowClass.name}
          </h2>
        </div>
        <button
          onClick={onGoBack}
          className="px-5 py-2.5 bg-gray-800 border border-gray-600 text-gray-200 rounded hover:bg-gray-700 hover:border-gray-400 transition-all duration-300 flex items-center shadow-lg group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Return to Menu
        </button>
      </div>

      {userRole === 'admin' && (
        <div className="mb-6 bg-yellow-900/20 border border-yellow-500/40 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out">
          <div 
             className="p-4 flex items-center justify-between cursor-pointer hover:bg-yellow-900/30 transition-colors rounded-t-lg"
             onClick={() => setShowAdminConfig(!showAdminConfig)}
          >
            <div className="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400 mr-3">
                 <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
               </svg>
               <h3 className="text-lg font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                  Admin Mode
                  <span className="text-xs bg-yellow-600/50 text-yellow-100 px-2 py-0.5 rounded border border-yellow-500/30">Configuration</span>
               </h3>
            </div>
            <button className="text-yellow-400 focus:outline-none">
               {showAdminConfig ? (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                   <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
                 </svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                   <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                 </svg>
               )}
            </button>
          </div>
          
          {showAdminConfig && (
            <div className="p-4 pt-0 border-t border-yellow-500/20 animate-fade-in">
              <div className="mt-3 p-3 bg-gray-900/50 rounded border border-yellow-500/10">
                  <label className="block text-sm font-bold text-yellow-200 mb-2">Source Injection</label>
                  <p className="text-xs text-gray-400 mb-2">Enter URLs (one per line) to override default AI knowledge with specific guides.</p>
                  <textarea
                    value={sourceUrls}
                    onChange={(e) => setSourceUrls(e.target.value)}
                    placeholder="https://www.wowhead.com/guide/class/spec/..."
                    className="w-full h-24 p-3 bg-gray-800/80 border border-gray-600 rounded text-sm text-gray-200 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition font-mono"
                  />
                  <button
                    onClick={handleRegenerateWithSources}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm font-bold rounded hover:bg-yellow-500 transition-colors duration-300 flex items-center shadow-md ml-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 17H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    Regenerate Content
                  </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 relative overflow-hidden">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--class-color)] to-transparent opacity-50"></div>

        <div className="border-b border-gray-700 px-4 overflow-x-auto bg-gray-900/90">
          <nav className="-mb-px flex space-x-1 min-w-max">
            {TAB_DEFINITIONS.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm md:text-base font-bold rounded-t-lg transition-all duration-200 focus:outline-none border-b-2 ${
                    activeTab === tab.id
                      ? `bg-gray-800 text-white border-[var(--class-color)] shadow-[inset_0_10px_20px_-10px_rgba(0,0,0,0.5)]`
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-700/50'
                  }`}
                  style={{
                    borderColor: activeTab === tab.id ? wowClass.color : 'transparent',
                  }}
                >
                  <span className={`mr-2 ${activeTab === tab.id ? 'text-[var(--class-color)]' : 'text-gray-500 group-hover:text-gray-300'}`} style={activeTab === tab.id ? { color: wowClass.color } : {}}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
            ))}
          </nav>
        </div>
        
        {/* Sub-navigation for Specs or Dungeons */}
        <div className="bg-gray-800/50 border-b border-gray-700 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
           {(activeTab === 'specs' || activeTab === 'dungeons' || activeTab === 'rotations') && (
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Select Spec:</span>
                {wowClass.specs.map(spec => 
                  <button
                    key={spec.id}
                    onClick={() => setActiveSpec(spec)}
                    className={`flex items-center px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wide rounded-md transition-all duration-200 transform border ${
                      activeSpec.id === spec.id ? 'text-white shadow-lg scale-105 border-transparent' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                    }`}
                    style={{
                      backgroundColor: activeSpec.id === spec.id ? wowClass.color : undefined,
                      boxShadow: activeSpec.id === spec.id ? `0 0 15px -3px ${wowClass.color}` : 'none',
                    }}
                  >
                    <SpecIcon spec={spec} className="w-4 h-4 mr-2" />
                    {spec.name}
                  </button>
                )}
            </div>
           )}
           
           {/* Dungeon Selector */}
           {activeTab === 'dungeons' && (
             <div className="flex flex-col md:flex-row md:items-center w-full md:w-auto mt-2 md:mt-0 md:ml-auto gap-3">
                {/* Expansion Filter */}
                <div className="flex items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 whitespace-nowrap">Expansion:</span>
                    <select
                        value={selectedExpansion}
                        onChange={(e) => setSelectedExpansion(e.target.value)}
                        className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--class-color)] focus:border-[var(--class-color)] block w-full md:w-auto p-2.5"
                        style={{ borderColor: wowClass.color }}
                    >
                        {EXPANSIONS.map(exp => (
                            <option key={exp} value={exp}>{exp}</option>
                        ))}
                    </select>
                </div>

                {/* Dungeon Select */}
                <div className="flex items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 whitespace-nowrap">Dungeon:</span>
                    <select 
                      value={selectedDungeon.name}
                      onChange={(e) => {
                        const d = DUNGEONS.find(dung => dung.name === e.target.value);
                        if (d) setSelectedDungeon(d);
                      }}
                      className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--class-color)] focus:border-[var(--class-color)] block w-full md:w-auto p-2.5 min-w-[200px]"
                      style={{ borderColor: wowClass.color }}
                    >
                      {filteredDungeons.map(d => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                </div>
             </div>
           )}
        </div>

        <GuideSection
          title={getTabTitle()}
          icon={getTabIcon()}
          isLoading={isLoading}
          content={content}
          error={error}
        />
      </div>
    </div>
  );
};

export default ClassHub;
