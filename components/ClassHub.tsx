import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { WowClass, Specialization, UserRole, Dungeon } from '../types.ts';
import { DUNGEONS, EXPANSIONS } from '../constants.ts';
import * as geminiService from '../services/geminiService.ts';
import { setRetryProgressCallback } from '../services/geminiService.ts';
import { cacheService } from '../services/cacheService.ts';
import { validateAndPrepareGuideRequest } from '../services/classOrchestratorService.ts';
import GuideSection from './GuideSection.tsx';
import { ClassIconRenderer } from './ClassIconRenderer.tsx';
import { VideoTutorials } from './VideoTutorials.tsx';
import '../styles/animations.css';

interface ClassHubProps {
  wowClass: WowClass;
  onGoBack: () => void;
  userRole: UserRole;
}

type TabId = 'overview' | 'specs' | 'rotations' | 'addons' | 'dungeons' | 'videos';

import { useI18n } from '../contexts/I18nContext.tsx';

const ClassHub: React.FC<ClassHubProps> = ({ wowClass, onGoBack }) => {
  const { t } = useI18n();
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

  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headerRef.current?.focus();
  }, []);

  // Load guide content when tab or spec changes
  useEffect(() => {
    if (activeTab !== 'videos') {
      loadGuideContent();
    }
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
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load guide:', errorMsg);
      setGuideContent(t('hub.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [wowClass, activeSpec, activeTab, selectedDungeon]);

  const tabDefinitions = useMemo(
    () => [
      { id: 'overview' as TabId, label: t('tab.overview') },
      { id: 'specs' as TabId, label: t('tab.specs') },
      { id: 'rotations' as TabId, label: t('tab.rotations') },
      { id: 'addons' as TabId, label: t('tab.addons') },
      { id: 'dungeons' as TabId, label: t('tab.dungeons') },
      { id: 'videos' as TabId, label: t('tab.videos') },
    ],
    [t]
  );

  return (
    <div
      className="animate-fade-in"
      style={{ '--class-color': wowClass.color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            ← {t('common.back')}
          </button>
          <div className="flex items-center gap-3">
            <ClassIconRenderer classId={wowClass.id} className="w-10 h-10" />
            <h1
              ref={headerRef}
              tabIndex={-1}
              className="text-3xl font-bold focus:outline-none"
              style={{ color: wowClass.color }}
            >
              {wowClass.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-effect-strong rounded-xl overflow-hidden shadow-2xl">
        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/20 backdrop-blur-md">
          {tabDefinitions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-4 text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden ${activeTab === tab.id
                  ? 'text-white bg-white/5'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              {activeTab === tab.id && (
                <span
                  className="absolute bottom-0 left-0 w-full h-0.5 shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: wowClass.color, color: wowClass.color }}
                />
              )}
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
                className={`px-4 py-2 rounded-lg transition ${activeSpec.id === spec.id
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
        {(activeTab === 'overview' ||
          activeTab === 'specs' ||
          activeTab === 'rotations' ||
          activeTab === 'addons') && (
            <div className="bg-gray-800/50 border-b border-gray-700 p-4">
              <select
                value={guideExpansion}
                onChange={(e) => setGuideExpansion(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              >
                <option value="all">{t('hub.allExpansions')}</option>
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
          {activeTab === 'videos' ? (
            <VideoTutorials wowClass={wowClass} />
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p className="mt-4 text-gray-400">{t('hub.loadingGuide')}</p>
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
