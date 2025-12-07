import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WOW_CLASSES } from '../constants.ts';
import type { WowClass } from '../types.ts';
import ClassCard from './ClassCard.tsx';
import '../styles/animations.css';

import { useI18n } from '../contexts/I18nContext.tsx';

interface ClassSelectionProps {
  onSelectClass: (wowClass: WowClass) => void;
}

const ClassSelection = ({ onSelectClass }: ClassSelectionProps) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Tank' | 'Healer' | 'Damage'>('All');
  const [armorFilter, setArmorFilter] = useState<'All' | 'Cloth' | 'Leather' | 'Mail' | 'Plate'>(
    'All'
  );
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Moderate' | 'Hard'>(
    'All'
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('wow_class_helper_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  const toggleFavorite = useCallback((e: React.MouseEvent, classId: string) => {
    e.stopPropagation();
    setFavorites((prevFavorites) => {
      const newFavorites = prevFavorites.includes(classId)
        ? prevFavorites.filter((id) => id !== classId)
        : [...prevFavorites, classId];

      localStorage.setItem('wow_class_helper_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const filteredClasses = useMemo(() => {
    return WOW_CLASSES.filter((wowClass) => {
      const matchesSearch =
        wowClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wowClass.specs.some((spec) => spec.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole =
        roleFilter === 'All' || wowClass.specs.some((spec) => spec.role === roleFilter);
      const matchesArmor = armorFilter === 'All' || wowClass.armorType === armorFilter;
      const matchesDifficulty =
        difficultyFilter === 'All' || wowClass.difficulty === difficultyFilter;

      return matchesSearch && matchesRole && matchesArmor && matchesDifficulty;
    }).sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [searchTerm, roleFilter, armorFilter, difficultyFilter, favorites]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setRoleFilter('All');
    setArmorFilter('All');
    setDifficultyFilter('All');
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h2
        className="text-4xl font-bold text-white mb-2 text-center"
        style={{ textShadow: '0 2px 5px rgba(0,0,0,0.7)' }}
      >
        {t('selection.title')}
      </h2>
      <p
        className="text-lg text-gray-400 mb-8 text-center max-w-2xl"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
      >
        {t('selection.subtitle')}
      </p>

      {/* Filters */}
      <div className="w-full max-w-4xl mb-8 glass-effect p-6 rounded-2xl border border-white/10 flex flex-col gap-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t('selection.searchPlaceholder')}
                aria-label="Search classes"
                className="block w-full pl-11 pr-4 py-3 border border-gray-700 rounded-xl leading-5 bg-black/20 text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-black/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 sm:text-sm transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {(['All', 'Tank', 'Healer', 'Damage'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                aria-label={`Filter by role: ${role}`}
                aria-pressed={roleFilter === role}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  roleFilter === role
                    ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                }`}
              >
                {t(`role.${role.toLowerCase()}`)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            aria-expanded={showAdvancedFilters}
            aria-controls="advanced-filters-section"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
              showAdvancedFilters
                ? 'bg-gray-700 border-yellow-500 text-yellow-500'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t('filter.moreFilters')} {showAdvancedFilters ? '▲' : '▼'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div
            id="advanced-filters-section"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700 animate-fade-in"
          >
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t('filter.armor')}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['All', 'Cloth', 'Leather', 'Mail', 'Plate'] as const).map((armor) => (
                  <button
                    key={armor}
                    onClick={() => setArmorFilter(armor)}
                    aria-pressed={armorFilter === armor}
                    aria-label={`Filter by armor: ${armor}`}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      armorFilter === armor
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {armor === 'All' ? t('role.all') : t(`armor.${armor.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t('filter.difficulty')}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['All', 'Easy', 'Moderate', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    aria-pressed={difficultyFilter === diff}
                    aria-label={`Filter by difficulty: ${diff}`}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      difficultyFilter === diff
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {diff === 'All' ? t('role.all') : t(`difficulty.${diff.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">{t('selection.noResults')}</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-yellow-500 hover:text-yellow-400 underline"
          >
            {t('selection.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full max-w-7xl px-4">
          {filteredClasses.map((wowClass) => (
            <ClassCard
              key={wowClass.id}
              wowClass={wowClass}
              onClick={() => onSelectClass(wowClass)}
              isFavorite={favorites.includes(wowClass.id)}
              onToggleFavorite={(e) => toggleFavorite(e, wowClass.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassSelection;
