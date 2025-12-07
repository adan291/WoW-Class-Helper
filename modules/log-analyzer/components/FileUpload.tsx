import React, { useRef, useState } from 'react';
import { LogSummary } from '../types';
import { parseLogFile, generateMockLog } from '../services/logParser';
import { LoadingOverlayEnhanced } from '../../../components/LoadingOverlayEnhanced';

interface FileUploadProps {
  onDataLoaded: (data: LogSummary) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const data = await parseLogFile(file);
      onDataLoaded(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to parse file. Make sure it's a valid WoW combat log text file.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadDemo = () => {
    setLoading(true);
    setTimeout(() => {
      const data = generateMockLog();
      onDataLoaded(data);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-fade-in">
      <div className="max-w-2xl w-full bg-gray-900 border border-gray-700 p-10 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-yellow-500 mb-2">Upload Combat Log</h2>
        <p className="text-gray-400 mb-8">
          Select a .txt or .log file from World of Warcraft to analyze.
        </p>

        <div
          className="relative border-2 border-dashed border-gray-700 hover:border-yellow-500 transition-colors rounded-lg p-12 cursor-pointer bg-gray-800 min-h-[200px]"
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.log"
          />
          <LoadingOverlayEnhanced
            isVisible={loading}
            message="Parsing arcane sigils..."
            subMessage="Decoding combat events"
            variant="arcane"
            fullScreen={false}
          />
          {!loading && (
            <div className="flex flex-col items-center">
              <svg
                className="w-16 h-16 text-gray-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-medium text-white">Click to upload Log</p>
              <p className="text-sm text-gray-500 mt-2">Supports standard CLEU format</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center text-red-200 gap-3 text-left">
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-gray-400 mb-4">Don't have a log handy?</p>
          <button
            onClick={loadDemo}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            🔥 Load Ragnaros Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
