/**
 * Guide Builder Component
 * Create and edit custom guides
 */

import React, { useState, useCallback, useMemo } from 'react';
import { guideService, CustomGuide, GuideSection } from '../services/guideService';

interface GuideBuilderProps {
  userId: string;
  onGuideSaved?: (guide: CustomGuide) => void;
}

export const GuideBuilder: React.FC<GuideBuilderProps> = ({ userId, onGuideSaved }) => {
  const [guides, setGuides] = useState<CustomGuide[]>(() =>
    guideService.getUserGuides(userId)
  );
  const [selectedGuide, setSelectedGuide] = useState<CustomGuide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'class',
    difficulty: 'intermediate' as const,
  });

  const [sectionForm, setSectionForm] = useState({
    type: 'heading' as const,
    content: '',
  });

  const stats = useMemo(() => guideService.getGuideStats(), []);

  const handleCreateGuide = useCallback(() => {
    if (!formData.title.trim()) return;

    const guide = guideService.createGuide(
      formData.title,
      formData.description,
      userId,
      formData.category,
      formData.difficulty
    );

    setGuides((prev) => [guide, ...prev]);
    setSelectedGuide(guide);
    setFormData({ title: '', description: '', category: 'class', difficulty: 'intermediate' });
    setIsCreating(false);

    onGuideSaved?.(guide);
  }, [formData, userId, onGuideSaved]);

  const handleAddSection = useCallback(() => {
    if (!selectedGuide || !sectionForm.content.trim()) return;

    const section = guideService.addSection(selectedGuide.id, {
      type: sectionForm.type,
      content: sectionForm.content,
    });

    if (section) {
      const updated = guideService.getGuide(selectedGuide.id);
      if (updated) {
        setSelectedGuide(updated);
        setSectionForm({ type: 'heading', content: '' });
      }
    }
  }, [selectedGuide, sectionForm]);

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (!selectedGuide) return;

      guideService.deleteSection(selectedGuide.id, sectionId);
      const updated = guideService.getGuide(selectedGuide.id);
      if (updated) {
        setSelectedGuide(updated);
      }
    },
    [selectedGuide]
  );

  const handlePublishGuide = useCallback(() => {
    if (!selectedGuide) return;

    if (selectedGuide.sections.length === 0) {
      alert('Add at least one section before publishing');
      return;
    }

    guideService.publishGuide(selectedGuide.id);
    const updated = guideService.getGuide(selectedGuide.id);
    if (updated) {
      setSelectedGuide(updated);
      setGuides((prev) =>
        prev.map((g) => (g.id === updated.id ? updated : g))
      );
    }
  }, [selectedGuide]);

  const handleDeleteGuide = useCallback((guideId: string) => {
    if (window.confirm('Delete this guide?')) {
      guideService.deleteGuide(guideId);
      setGuides((prev) => prev.filter((g) => g.id !== guideId));
      if (selectedGuide?.id === guideId) {
        setSelectedGuide(null);
      }
    }
  }, [selectedGuide]);

  const sectionTypeLabel = (type: GuideSection['type']) => {
    const labels: Record<GuideSection['type'], string> = {
      heading: 'Heading',
      paragraph: 'Paragraph',
      list: 'List',
      table: 'Table',
      image: 'Image',
      code: 'Code',
      quote: 'Quote',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Guide Builder</h2>
            <p className="text-gray-400 text-sm mt-1">Create and manage custom guides</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {isCreating ? 'Cancel' : '+ New Guide'}
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-blue-400">{stats.totalGuides}</p>
            <p className="text-xs text-gray-400">Total Guides</p>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-green-400">{stats.publishedGuides}</p>
            <p className="text-xs text-gray-400">Published</p>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-purple-400">{stats.totalViews}</p>
            <p className="text-xs text-gray-400">Total Views</p>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <p className="text-2xl font-bold text-yellow-400">{stats.totalLikes}</p>
            <p className="text-xs text-gray-400">Total Likes</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Create New Guide</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Guide title"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Guide description"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="class">Class</option>
                <option value="spec">Specialization</option>
                <option value="dungeon">Dungeon</option>
                <option value="raid">Raid</option>
                <option value="pvp">PvP</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateGuide}
              disabled={!formData.title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Create Guide
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Guides List & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guides List */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">My Guides ({guides.length})</h3>
          </div>

          <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {guides.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No guides yet</div>
            ) : (
              guides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`p-3 cursor-pointer hover:bg-gray-800 transition ${
                    selectedGuide?.id === guide.id ? 'bg-blue-900 bg-opacity-30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{guide.title}</p>
                      <p className="text-xs text-gray-400">
                        {guide.sections.length} sections
                      </p>
                    </div>
                    {guide.isPublished && (
                      <span className="text-xs px-2 py-1 bg-green-900 text-green-200 rounded">
                        Published
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Guide Editor */}
        {selectedGuide ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Guide Header */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedGuide.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{selectedGuide.description}</p>
                </div>
                <div className="flex gap-2">
                  {!selectedGuide.isPublished && (
                    <button
                      onClick={handlePublishGuide}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteGuide(selectedGuide.id)}
                    className="px-3 py-1 text-sm bg-red-900 text-red-200 rounded hover:bg-red-800 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-gray-800 rounded">
                  <p className="text-gray-400">Category</p>
                  <p className="text-white font-semibold">{selectedGuide.category}</p>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <p className="text-gray-400">Difficulty</p>
                  <p className="text-white font-semibold capitalize">{selectedGuide.difficulty}</p>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <p className="text-gray-400">Views</p>
                  <p className="text-white font-semibold">{selectedGuide.views}</p>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <p className="text-gray-400">Likes</p>
                  <p className="text-white font-semibold">{selectedGuide.likes}</p>
                </div>
              </div>
            </div>

            {/* Add Section Form */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 space-y-4">
              <h4 className="font-semibold text-white">Add Section</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
                  <select
                    value={sectionForm.type}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="heading">Heading</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="list">List</option>
                    <option value="table">Table</option>
                    <option value="code">Code</option>
                    <option value="quote">Quote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Content</label>
                <textarea
                  value={sectionForm.content}
                  onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                  placeholder="Section content"
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleAddSection}
                disabled={!sectionForm.content.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add Section
              </button>
            </div>

            {/* Sections List */}
            <div className="space-y-2">
              {selectedGuide.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-gray-900 rounded-lg border border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-400">{sectionTypeLabel(section.type)}</p>
                      <p className="text-white font-semibold line-clamp-2">{section.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-700 p-8 text-center text-gray-400">
            <p>Select a guide to edit or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};
