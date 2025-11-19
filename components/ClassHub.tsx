
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { WowClass, Specialization, UserRole, Dungeon } from '../types.ts';
import { DUNGEONS, EXPANSIONS } from '../constants.ts';
import * as geminiService from '../services/geminiService.ts';
import { cacheService } from '../services/cacheService.ts';
import GuideSection from './GuideSection.tsx';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';
import { SpecIcon } from './SpecIcon.tsx';
import { SpecCardEnhanced } from './SpecCardEnhanced.tsx';
import { TabNavigationEnhanced } from './TabNavigationEnhanced.tsx';
import { HeroSectionEnhanced } from './HeroSectionEnhanced.tsx';
import { AdminPanelEnhanced } from './AdminPanelEnhanced.tsx';
import '../styles/animations.css';

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

  // Memoize tab definitions to prevent unnecessary re-renders
  const tabDefinitions = useMemo(() => TAB_DEFINITIONS, []);

  const fetchContent = useCallback(async (urlsOverride?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate inputs with comprehensive checks
      if (!wowClass || !wowClass.id) {
        throw new Error('Invalid class selected. Please select a valid class.');
      }
      if (!activeSpec || !activeSpec.id) {
        throw new Error('Invalid specialization selected. Please select a valid specialization.');
      }
      if (activeTab === 'dungeons' && (!selectedDungeon || !selectedDungeon.name)) {
        throw new Error('Invalid dungeon selected. Please select a valid dungeon.');
      }

      // Validate tab selection
      const validTabs = ['overview', 'specs', 'rotations', 'addons', 'dungeons'];
      if (!validTabs.includes(activeTab)) {
        throw new Error(`Invalid tab selected: ${activeTab}`);
      }

      // Check cache first (only if no custom URLs override)
      // This implements lazy loading by preventing unnecessary API calls
      if (!urlsOverride) {
        const cachedContent = cacheService.get<string>(memoizedContentKey);
        if (cachedContent) {
          setContent(cachedContent);
          setIsLoading(false);
          return;
        }
      }

      // Lazy load content only when needed
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

      // Validate content response
      if (!newContent || typeof newContent !== 'string') {
        throw new Error('Invalid content received from API. The response was empty or malformed.');
      }

      if (newContent.trim().length === 0) {
        throw new Error('API returned empty content. Please try again.');
      }

      // Cache the content (1 hour TTL) to prevent redundant API calls
      cacheService.set(memoizedContentKey, newContent);

      setContent(newContent);
    } catch (err) {
      console.error("Guide generation error:", err);
      
      let errorMessage = 'An unexpected error occurred while generating the guide.';
      let errorType: 'api' | 'validation' | 'network' | 'unknown' = 'unknown';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Categorize error type for better UX
        if (err.message.includes('API') || err.message.includes('api')) {
          errorType = 'api';
        } else if (err.message.includes('Invalid') || err.message.includes('invalid')) {
          errorType = 'validation';
        } else if (err.message.includes('network') || err.message.includes('fetch') || err.message.includes('timeout')) {
          errorType = 'network';
        }
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
  
  const handleRegenerateWithSources = useCallback(() => {
    fetchContent(sourceUrls);
  }, [fetchContent, sourceUrls]);

  const getTabTitle = useCallback(() => {
    if (activeTab === 'specs') return `${activeSpec.name} ${wowClass.name} Build & Guide`;
    if (activeTab === 'rotations') return `${activeSpec.name} ${wowClass.name} Rotations`;
    if (activeTab === 'dungeons') return `${activeSpec.name} Tips for ${selectedDungeon.name}`;
    if (activeTab === 'addons') return 'Addons & WeakAuras';
    return 'Class Overview';
  }, [activeTab, activeSpec, wowClass, selectedDungeon]);
  
  const getTabIcon = useCallback(() => {
     if (activeTab === 'specs' || activeTab === 'rotations' || activeTab === 'dungeons') {
         return <SpecIcon spec={activeSpec} className="w-8 h-8 text-[var(--class-color)]" />;
     }
     if (activeTab === 'overview') return <ClassIconRenderer classId={wowClass.id} className="w-8 h-8 text-[var(--class-color)]" />;
     return null;
  }, [activeTab, activeSpec, wowClass]);

  return (
    <div className="animate-fade-in" style={{ '--class-color': wowClass.color } as React.CSSProperties}>
      <HeroSectionEnhanced wowClass={wowClass} onGoBack={onGoBack} />

      {userRole === 'admin' && (
        <AdminPanelEnhanced
          sourceUrls={sourceUrls}
          onSourceUrlsChange={setSourceUrls}
          onRegenerate={handleRegenerateWithSources}
          isLoading={isLoading}
        />
      )}

      <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 relative overflow-hidden">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--class-color)] to-transparent opacity-50"></div>

        <TabNavigationEnhanced
          tabs={tabDefinitions}
          activeTab={activeTab}
          onTabChange={(tabId: string) => setActiveTab(tabId as TabId)}
          classColor={wowClass.color}
        />
        
        {/* Sub-navigation for Specs or Dungeons */}
        <div className="bg-gray-800/50 border-b border-gray-700 p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
           {(activeTab === 'specs' || activeTab === 'dungeons' || activeTab === 'rotations') && (
              <div className="flex flex-wrap gap-3 items-center w-full">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Spec:</span>
                <div className="flex flex-wrap gap-2">
                  {wowClass.specs.map(spec => (
                    <SpecCardEnhanced
                      key={spec.id}
                      spec={spec}
                      wowClass={wowClass}
                      isActive={activeSpec.id === spec.id}
                      onClick={() => setActiveSpec(spec)}
                    />
                  ))}
                </div>
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
          onRetry={useCallback(() => fetchContent(), [fetchContent])}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default ClassHub;
