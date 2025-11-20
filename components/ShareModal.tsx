/**
 * Share Modal Component
 * Provides social media sharing options
 */

import React, { useState } from 'react';
import { sharingService } from '../services/sharingService.ts';
import { toastService } from '../services/toastService.ts';

interface ShareModalProps {
  classId: string;
  tab: string;
  specId?: string;
  title: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ classId, tab, specId, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareURL = sharingService.generateShareURL(classId, tab, specId);
  const shareCard = sharingService.generateShareCard(classId, tab, title);

  const handleCopyURL = async () => {
    const success = await sharingService.copyToClipboard(shareURL);
    if (success) {
      setCopied(true);
      toastService.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toastService.error('Failed to copy URL');
    }
  };

  const handleShareTwitter = () => {
    sharingService.shareToTwitter({
      title,
      description: shareCard,
      url: shareURL,
      hashtags: ['WoW', 'ClassHelper', 'Gaming'],
    });
  };

  const handleShareReddit = () => {
    sharingService.shareToReddit({
      title,
      description: shareCard,
      url: shareURL,
    });
  };

  const handleShareDiscord = async () => {
    const success = await sharingService.copyToClipboard(shareCard);
    if (success) {
      toastService.success('Message copied! Paste in Discord');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700 rounded-lg transition"
        title="Share"
      >
        🔗
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">🔗 Share Guide</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Share URL */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-300 mb-2">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareURL}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300"
                />
                <button
                  onClick={handleCopyURL}
                  className={`px-3 py-2 rounded text-xs font-bold transition ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={handleShareTwitter}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition flex items-center justify-center gap-2"
              >
                𝕏 Share on Twitter
              </button>
              <button
                onClick={handleShareReddit}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition flex items-center justify-center gap-2"
              >
                🔴 Share on Reddit
              </button>
              <button
                onClick={handleShareDiscord}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition flex items-center justify-center gap-2"
              >
                💬 Share on Discord
              </button>
            </div>

            {/* Share Card Preview */}
            <div className="p-3 bg-gray-700 rounded-lg mb-4">
              <p className="text-xs font-bold text-gray-300 mb-2">Preview:</p>
              <p className="text-xs text-gray-300 whitespace-pre-wrap break-words">{shareCard}</p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ShareModal);
