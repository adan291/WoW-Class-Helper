/**
 * Version History Component
 * Displays and manages content versions
 */

import React, { useState, useEffect } from 'react';
import { versioningService, type ContentVersion } from '../services/versioningService.ts';
import { toastService } from '../services/toastService.ts';

interface VersionHistoryProps {
  classId: string;
  tab: string;
  specId?: string;
  onRevert?: (content: string) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  classId,
  tab,
  specId,
  onRevert,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);

  useEffect(() => {
    const updateVersions = () => {
      const v = versioningService.getVersions(classId, tab, specId);
      setVersions(v);
    };

    updateVersions();
    const unsubscribe = versioningService.subscribe(updateVersions);
    return unsubscribe;
  }, [classId, tab, specId]);

  const handleRevert = (version: ContentVersion) => {
    const content = versioningService.revertToVersion(version.id, classId, tab, specId);
    if (content) {
      onRevert?.(content);
      toastService.success(`Reverted to ${version.createdAt.toLocaleString()}`);
      setIsOpen(false);
    }
  };

  const handleDelete = (versionId: string) => {
    if (confirm('Delete this version?')) {
      versioningService.deleteVersion(versionId, classId, tab, specId);
      toastService.info('Version deleted');
    }
  };

  const handleClear = () => {
    if (confirm('Delete all versions?')) {
      versioningService.clearVersions(classId, tab, specId);
      toastService.info('All versions cleared');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition ${
          versions.length > 0 ? 'bg-purple-600/30 hover:bg-purple-600/50' : 'hover:bg-gray-700'
        }`}
        title="Version History"
      >
        ⏱️
        {versions.length > 0 && (
          <span className="absolute top-0 right-0 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {versions.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">⏱️ Version History</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {versions.length > 0 ? (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {versions.map((version, idx) => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedVersion?.id === version.id
                          ? 'bg-purple-600/50 border border-purple-500'
                          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-200">
                            v{versions.length - idx}
                          </p>
                          <p className="text-xs text-gray-400">
                            {version.createdAt.toLocaleString()}
                          </p>
                          {version.message && (
                            <p className="text-xs text-gray-300 mt-1">{version.message}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevert(version);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                            title="Revert"
                          >
                            ↩️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(version.id);
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedVersion && (
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <p className="text-xs font-bold text-gray-300 mb-2">Preview:</p>
                    <p className="text-xs text-gray-300 max-h-20 overflow-y-auto whitespace-pre-wrap break-words">
                      {selectedVersion.content.substring(0, 200)}...
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleClear}
                    className="flex-1 px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded text-xs font-medium transition"
                  >
                    🗑️ Clear All
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs font-medium transition"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center py-4">No versions yet</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(VersionHistory);
