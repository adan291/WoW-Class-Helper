
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WOW_CLASSES } from '../constants.ts';
import type { WowClass } from '../types.ts';
import ClassCard from './ClassCard.tsx';
import '../styles/animations.css';

interface ClassSelectionProps {
  onSelectClass: (wowClass: WowClass) => void;
}

const ClassSelection = ({ onSelectClass }: ClassSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Tank' | 'Healer' | 'Damage'>('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('wow_class_helper_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const toggleFavorite = useCallback((e: React.MouseEvent, classId: string) => {
    e.stopPropagation();
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(classId)
        ? prevFavorites.filter(id => id !== classId)
        : [...prevFavorites, classId];
      
      localStorage.setItem('wow_class_helper_favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const filteredClasses = useMemo(() => {
    return WOW_CLASSES.filter(wowClass => {
      const matchesSearch = wowClass.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || wowClass.specs.some(spec => spec.role === roleFilter);
      return matchesSearch && matchesRole;
    }).sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [searchTerm, roleFilter, favorites]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setRoleFilter('All');
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-4xl font-bold text-white mb-2 text-center" style={{textShadow: '0 2px 5px rgba(0,0,0,0.7)'}}>Select Your Class</h2>
      <p className="text-lg text-gray-400 mb-8 text-center max-w-2xl" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>Choose your class to get AI-powered guides, tips, and strategies.</p>
      
      {/* Filters */}
      <div className="w-full max-w-4xl mb-8 bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-4 backdrop-blur-sm">
        <div className="flex-1">
           <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search classes..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 sm:text-sm transition duration-150 ease-in-out"
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
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No classes found matching your criteria.</p>
          <button 
            onClick={handleClearFilters}
            className="mt-4 text-yellow-500 hover:text-yellow-400 underline"
          >
            Clear Filters
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
