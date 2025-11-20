/**
 * Patch Notes Panel Component
 * Display and manage patch notes
 */

import React, { useState, useMemo } from 'react';
import { patchNotesService, PatchNote } from '../services/patchNotesService';

interface PatchNotesPanelProps {
  onPatchSelected?: (patch: PatchNote) => void;
}

export const PatchNotesPanel: React.FC<PatchNotesPanelProps> = ({ onPatchSelected }) => {
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>(() =>
    patchNotesService.getAllPatchNotes()
  );
  const [selectedPatch, setSelectedPatch] = useState<PatchNote | null>(() =>
    patchNotesService.getLatestPatchNote()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const filteredPatches = useMemo(() => {
    if (!searchQuery.trim()) return patchNotes;
    return patchNotesService.searchPatchNotes(searchQuery);
  }, [patchNotes, searchQuery]);

  const stats = useMemo(() => {
    if (!selectedPatch) return null;
    return patchNotesService.getPatchStats(selectedPatch.version);
  }, [selectedPatch]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const getChangeIcon = (type: string) => {
    const icons: Record<string, string> = {
      buff: '📈',
      nerf: '📉',
      fix: '🔧',
      new: '✨',
      removed: '❌',
      changed: '🔄',
    };
    return icons[type] || '•';
  };

  const getImpactColor = (impact: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-400',
      medium: 'text-yellow-400',
      low: 'text-green-400',
    };
    return colors[impact] || 'text-gray-400';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      classes: '⚔️',
      dungeons: '🏰',
      raids: '👑',
      pvp: '⚡',
      items: '💎',
      general: '📢',
      'bug-fixes': '🐛',
    };
    return icons[category] || '•';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Patch Notes</h2>
        <p className="text-gray-400 text-sm">Latest updates and changes</p>
      </div>

      {/* Search */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patch notes..."
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patches List */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Versions ({filteredPatches.length})</h3>
          </div>

          <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {filteredPatches.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No patches found</div>
            ) : (
              filteredPatches.map((patch) => (
                <div
                  key={patch.id}
                  onClick={() => {
                    setSelectedPatch(patch);
                    onPatchSelected?.(patch);
                  }}
                  className={`p-3 cursor-pointer hover:bg-gray-800 transition ${
                    selectedPatch?.id === patch.id ? 'bg-blue-900 bg-opacity-30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">v{patch.version}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(patch.releaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    {patch.isLatest && (
                      <span className="text-xs px-2 py-1 bg-blue-900 text-blue-200 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patch Details */}
        {selectedPatch ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">v{selectedPatch.version}</h3>
                  <p className="text-gray-400 text-sm mt-1">{selectedPatch.title}</p>
                </div>
                {selectedPatch.isLatest && (
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                    Latest Patch
                  </span>
                )}
              </div>

              <p className="text-gray-300 text-sm mb-4">
                Released: {new Date(selectedPatch.releaseDate).toLocaleDateString()}
              </p>

              {/* Highlights */}
              {selectedPatch.highlights.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">Highlights</p>
                  <ul className="space-y-1">
                    {selectedPatch.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                  <p className="text-2xl font-bold text-blue-400">{stats.totalChanges}</p>
                  <p className="text-xs text-gray-400">Total Changes</p>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                  <p className="text-2xl font-bold text-green-400">{stats.buffs}</p>
                  <p className="text-xs text-gray-400">Buffs</p>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                  <p className="text-2xl font-bold text-red-400">{stats.nerfs}</p>
                  <p className="text-xs text-gray-400">Nerfs</p>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-3">
                  <p className="text-2xl font-bold text-yellow-400">{stats.fixes}</p>
                  <p className="text-xs text-gray-400">Fixes</p>
                </div>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-2">
              {selectedPatch.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(section.category)}</span>
                      <h4 className="font-semibold text-white">{section.title}</h4>
                      <span className="text-xs text-gray-400">
                        ({section.changes.length})
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {expandedSections.has(section.id) ? '▼' : '▶'}
                    </span>
                  </button>

                  {expandedSections.has(section.id) && (
                    <div className="border-t border-gray-700 p-4 space-y-2">
                      {section.changes.map((change) => (
                        <div
                          key={change.id}
                          className="flex items-start gap-3 p-2 bg-gray-800 rounded"
                        >
                          <span className="text-lg mt-0.5">{getChangeIcon(change.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-200">{change.description}</p>
                            <p className={`text-xs mt-1 ${getImpactColor(change.impact)}`}>
                              Impact: {change.impact}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-700 p-8 text-center text-gray-400">
            <p>Select a patch to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
