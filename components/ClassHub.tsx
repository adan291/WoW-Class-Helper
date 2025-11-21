import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { WowClass, Specialization, UserRole, Dungeon } from '../types.ts';
import { DUNGEONS, EXPANSIONS } from '../constants.ts';
import * as geminiService from '../services/geminiService.ts';
import { setRetryProgressCallback } from '../services/geminiService.ts';
import { cacheService } from '../services/cacheService.ts';
import { validateAndPrepareGuideRequest } from '../services/classOrchestratorService.ts';
import GuideSection from './GuideSection.tsx';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';
import '../styles/animations.css';

interface ClassHubProps {
  wowClass: WowClass;
  onGoBack: () => void;
  userRole: UserRole;
}

type TabId = 'overview' | 'specs' | 'rotations' | 'addons' | 'dungeons';

const ClassHub: React.FC<ClassHubProps> = ({ wowClass, onGoBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activeSpec, setActiveSpec] = useState<Specialization>(wowClass.specs[0]);
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [guideContent, setGuideContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [guideExpansion, setGuideExpansion] = useState<string>('all');

  // Set initial dungeon
  useEffect(() => {
    if (DUNGEONS.length > 0) {
      setSelectedDungeon(DUNGEONS[0]);
    }
  }, []);

  // Load guide content when tab or spec changes
  useEffect(() => {
    loadGuideContent();
  }, [activeTab, activeSpec, selectedDungeon, guideExpansion]);

  const loadGuideContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = validateAndPrepareGuideRequest(
        wowClass.id,
        activeSpec.id,
        selectedDungeon?.name
      );

      if (!result.isValid || !result.context) {
        throw new Error(result.errors.join(', '));
      }

      const cacheKey = `guide_${wowClass.id}_${activeSpec.id}_${activeTab}_${selectedDungeon?.name || 'none'}`;
      const cached = cacheService.get(cacheKey);

      if (cached && typeof cached === 'string') {
        setGuideContent(cached);
        return;
      }

      setRetryProgressCallback((progress) => {
        console.log(`Retry progress: ${progress}%`);
      });

      const content = await geminiService.generateGuide(result.context);
      cacheService.set(cacheKey, content);
      setGuideContent(content);
    } catch (error) {
      console.error('Failed to load guide:', error);
      setGuideContent('Failed to load guide content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [wowClass, activeSpec, activeTab, selectedDungeon]);

  const tabDefinitions = useMemo(
    () => [
      { id: 'overview' as TabId, label: 'Overview' },
      { id: 'specs' as TabId, label: 'Specs' },
      { id: 'rotations' as TabId, label: 'Rotations' },
      { id: 'addons' as TabId, label: 'Addons' },
      { id: 'dungeons' as TabId, label: 'Dungeons' },
    ],
    []
  );

  return (
    <div className="animate-fade-in" style={{ '--class-color': wowClass.color } as React.CSSProperties}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <ClassIconRenderer classId={wowClass.id} className="w-10 h-10" />
            <h1 className="text-3xl font-bold" style={{ color: wowClass.color }}>
              {wowClass.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 bg-gray-800/50">
          {tabDefinitions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white border-b-2'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={
                activeTab === tab.id
                  ? { borderBottomColor: wowClass.color }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Spec Selection */}
        {(activeTab === 'specs' || activeTab === 'rotations' || activeTab === 'dungeons') && (
          <div className="bg-gray-800/50 border-b border-gray-700 p-4 flex flex-wrap gap-2">
            {wowClass.specs.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setActiveSpec(spec)}
                className={`px-4 py-2 rounded-lg transition ${
                  activeSpec.id === spec.id
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {spec.name}
              </button>
            ))}
          </div>
        )}

        {/* Dungeon Selection */}
        {activeTab === 'dungeons' && (
          <div className="bg-gray-800/50 border-b border-gray-700 p-4">
            <select
              value={selectedDungeon?.name || ''}
              onChange={(e) => {
                const dungeon = DUNGEONS.find((d) => d.name === e.target.value);
                setSelectedDungeon(dungeon || null);
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
            >
              {DUNGEONS.map((dungeon) => (
                <option key={dungeon.name} value={dungeon.name}>
                  {dungeon.name} ({dungeon.expansion})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Expansion Filter */}
        {(activeTab === 'overview' || activeTab === 'specs' || activeTab === 'rotations' || activeTab === 'addons') && (
          <div className="bg-gray-800/50 border-b border-gray-700 p-4">
            <select
              value={guideExpansion}
              onChange={(e) => setGuideExpansion(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
            >
              <option value="all">All Expansions</option>
              {EXPANSIONS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Guide Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p className="mt-4 text-gray-400">Loading guide...</p>
            </div>
          ) : (
            <GuideSection content={guideContent} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassHub;
