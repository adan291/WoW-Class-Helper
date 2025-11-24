import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.ts';
import { useAuth } from '../../hooks/useAuth.ts';

interface Guide {
  id: string;
  user_id: string;
  class_id: string;
  spec_id: string;
  content: string;
  created_at: string;
  profiles: { email: string };
}

export const AdminContent: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    const data = await adminService.getAllGuides();
    setGuides(data);
    setLoading(false);
  };

  const handleDelete = async (guideId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this guide?')) return;

    const success = await adminService.deleteGuide(user.id, guideId);
    if (success) {
      loadGuides();
      setSelectedGuide(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Content Moderation</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Guides List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">User Guides ({guides.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedGuide?.id === guide.id
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-750 text-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{guide.class_id}</p>
                      <p className="text-sm opacity-75">{guide.spec_id}</p>
                    </div>
                    <span className="text-xs opacity-75">
                      {new Date(guide.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs opacity-75">By: {guide.profiles.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guide Preview */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            {selectedGuide ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedGuide.class_id} - {selectedGuide.spec_id}
                    </h2>
                    <p className="text-sm text-gray-400">By: {selectedGuide.profiles.email}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedGuide.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {selectedGuide.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a guide to preview
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
