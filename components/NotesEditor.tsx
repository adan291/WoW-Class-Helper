/**
 * Notes Editor Component
 * Edit and manage personal notes
 */

import React, { useState, useEffect } from 'react';
import { notesService, type Note } from '../services/notesService.ts';
import { toastService } from '../services/toastService.ts';

interface NotesEditorProps {
  classId: string;
  tab: string;
  specId?: string;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({ classId, tab, specId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const currentNote = notesService.getNote(classId, tab, specId);
    setNote(currentNote);
    setContent(currentNote?.content || '');
  }, [classId, tab, specId]);

  const handleSave = () => {
    notesService.updateNote(classId, tab, content, specId);
    setNote(notesService.getNote(classId, tab, specId));
    toastService.success('Note saved');
  };

  const handleDelete = () => {
    if (confirm('Delete this note?')) {
      notesService.deleteNote(classId, tab, specId);
      setContent('');
      setNote(null);
      toastService.info('Note deleted');
    }
  };

  const handleExport = () => {
    const markdown = notesService.exportAsMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toastService.success('Notes exported');
  };

  const hasNote = note !== null && note.content.trim().length > 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition ${
          hasNote ? 'bg-blue-600/30 hover:bg-blue-600/50' : 'hover:bg-gray-700'
        }`}
        title="Notes"
      >
        📝
        {hasNote && <span className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full"></span>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">📝 Notes</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-2 py-1 rounded text-xs font-medium transition ${
                    showPreview
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {showPreview ? '✏️ Edit' : '👁️ Preview'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Note Info */}
            <div className="mb-3 text-xs text-gray-400">
              <p>
                {classId} • {tab}
                {specId && ` • ${specId}`}
              </p>
              {note && (
                <p>
                  Created: {note.createdAt.toLocaleString()} | Updated:{' '}
                  {note.updatedAt.toLocaleString()}
                </p>
              )}
            </div>

            {/* Editor or Preview */}
            {!showPreview ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes here... (Markdown supported)"
                className="w-full h-48 p-3 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:border-blue-500 font-mono text-sm resize-none"
              />
            ) : (
              <div className="w-full h-48 p-3 bg-gray-700 border border-gray-600 rounded text-gray-200 overflow-y-auto prose prose-invert max-w-none">
                <div className="text-sm whitespace-pre-wrap break-words">
                  {content || 'No content to preview'}
                </div>
              </div>
            )}

            {/* Character Count */}
            <div className="mt-2 text-xs text-gray-400">
              {content.length} characters
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
              >
                💾 Save
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition"
              >
                📥 Export All
              </button>
              {hasNote && (
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded font-medium transition"
                >
                  🗑️ Delete
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded font-medium transition"
              >
                Close
              </button>
            </div>

            {/* Help */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-200">
              <p className="font-bold mb-1">💡 Markdown Support:</p>
              <p>Use **bold**, *italic*, `code`, # headers, - lists, etc.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(NotesEditor);
