/**
 * Filter Panel Component
 * Advanced filtering interface
 */

import React, { useState, useEffect } from 'react';
import { filterService, type Role, type Difficulty, type FilterPreset } from '../services/filterService.ts';
import { EXPANSIONS } from '../constants.ts';
import { toastService } from '../services/toastService.ts';

interface FilterPanelProps {
  onFiltersChange?: (hasFilters: boolean) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<Role>('all');
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const [expansion, setExpansion] = useState<string>('');
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    const filters = filterService.getFilters();
    setRole(filters.role);
    setDifficulty(filters.difficulty);
    setExpansion(filters.expansion || '');
    setPresets(filterService.getPresets());
  }, []);

  const handleApplyFilters = () => {
    filterService.setFilters({
      role,
      difficulty,
      expansion: expansion || undefined,
    });
    onFiltersChange?.(filterService.hasActiveFilters());
    toastService.success('Filters applied');
  };

  const handleClearFilters = () => {
    setRole('all');
    setDifficulty('all');
    setExpansion('');
    filterService.clearFilters();
    onFiltersChange?.(false);
    toastService.info('Filters cleared');
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toastService.warning('Preset name cannot be empty');
      return;
    }

    filterService.createPreset(newPresetName, {
      name: newPresetName,
      role,
      difficulty,
      expansion: expansion || undefined,
    });

    setPresets(filterService.getPresets());
    setNewPresetName('');
    toastService.success(`Preset "${newPresetName}" saved`);
  };

  const handleApplyPreset = (presetId: string) => {
    filterService.applyPreset(presetId);
    const filters = filterService.getFilters();
    setRole(filters.role);
    setDifficulty(filters.difficulty);
    setExpansion(filters.expansion || '');
    onFiltersChange?.(true);
    toastService.success('Preset applied');
  };

  const handleDeletePreset = (presetId: string) => {
    filterService.deletePreset(presetId);
    setPresets(filterService.getPresets());
    toastService.info('Preset deleted');
  };

  const hasActiveFilters = filterService.hasActiveFilters();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition relative ${
          hasActiveFilters ? 'bg-yellow-600/30 hover:bg-yellow-600/50' : 'hover:bg-gray-700'
        }`}
        title="Filters"
      >
        🔍
        {hasActiveFilters && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">🔍 Advanced Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Role Filter */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:border-yellow-500"
              >
                <option value="all">All Roles</option>
                <option value="tank">🛡️ Tank</option>
                <option value="healer">💚 Healer</option>
                <option value="dps">⚔️ DPS</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-300 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:border-yellow-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">🟢 Beginner</option>
                <option value="intermediate">🟡 Intermediate</option>
                <option value="advanced">🔴 Advanced</option>
              </select>
            </div>

            {/* Expansion Filter */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-300 mb-2">Expansion</label>
              <select
                value={expansion}
                onChange={(e) => setExpansion(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:border-yellow-500"
              >
                <option value="">All Expansions</option>
                {EXPANSIONS.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Description */}
            {hasActiveFilters && (
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-200">
                <p className="font-bold mb-1">Active Filters:</p>
                <p>{filterService.getFilterDescription()}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium transition"
              >
                ✓ Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded font-medium transition"
              >
                ✕ Clear
              </button>
            </div>

            {/* Save Preset */}
            <div className="mb-4 p-3 bg-gray-700 rounded">
              <label className="block text-xs font-bold text-gray-300 mb-2">Save as Preset</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset name..."
                  className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-gray-200 placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
                />
                <button
                  onClick={handleSavePreset}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
                >
                  💾
                </button>
              </div>
            </div>

            {/* Presets */}
            {presets.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">Saved Presets</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-2 bg-gray-700 rounded flex items-center justify-between hover:bg-gray-600 transition"
                    >
                      <button
                        onClick={() => handleApplyPreset(preset.id)}
                        className="flex-1 text-left text-sm text-gray-200 hover:text-yellow-400"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(FilterPanel);
