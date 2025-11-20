/**
 * Export Panel Component
 * Export content in various formats
 */

import React, { useState } from 'react';
import { exportService } from '../services/exportService.ts';
import { toastService } from '../services/toastService.ts';

interface ExportPanelProps {
  title: string;
  content: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format: 'markdown' | 'html' | 'json') => {
    try {
      let exportContent = '';
      let filename = '';
      let mimeType = 'text/plain';

      switch (format) {
        case 'markdown':
          exportContent = exportService.exportAsMarkdown(title, content);
          filename = `${title.replace(/\s+/g, '_')}.md`;
          mimeType = 'text/markdown';
          break;
        case 'html':
          exportContent = exportService.exportAsHTML(title, content);
          filename = `${title.replace(/\s+/g, '_')}.html`;
          mimeType = 'text/html';
          break;
        case 'json':
          exportContent = exportService.exportAsJSON(title, content);
          filename = `${title.replace(/\s+/g, '_')}.json`;
          mimeType = 'application/json';
          break;
      }

      exportService.downloadFile(exportContent, filename, mimeType);
      toastService.success(`Exported as ${format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      toastService.error('Failed to export content');
    }
  };

  const handleCopyMarkdown = async () => {
    const markdown = exportService.exportAsMarkdown(title, content);
    const success = await exportService.copyToClipboard(markdown);
    if (success) {
      toastService.success('Copied to clipboard!');
    } else {
      toastService.error('Failed to copy to clipboard');
    }
  };

  const handleShareURL = () => {
    const url = exportService.generateShareURL('', 'overview');
    exportService.copyToClipboard(url);
    toastService.success('Share URL copied!');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition"
        title="Export"
      >
        📤
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">Export Content</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {/* Download Options */}
              <div>
                <p className="text-sm font-bold text-gray-300 mb-2">📥 Download As</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleExport('markdown')}
                    className="w-full px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg font-medium transition text-left"
                  >
                    📝 Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleExport('html')}
                    className="w-full px-4 py-2 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded-lg font-medium transition text-left"
                  >
                    🌐 HTML (.html)
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg font-medium transition text-left"
                  >
                    📦 JSON (.json)
                  </button>
                </div>
              </div>

              {/* Copy Options */}
              <div>
                <p className="text-sm font-bold text-gray-300 mb-2">📋 Copy To Clipboard</p>
                <button
                  onClick={handleCopyMarkdown}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
                >
                  📋 Copy as Markdown
                </button>
              </div>

              {/* Share */}
              <div>
                <p className="text-sm font-bold text-gray-300 mb-2">🔗 Share</p>
                <button
                  onClick={handleShareURL}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
                >
                  🔗 Copy Share URL
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ExportPanel);
