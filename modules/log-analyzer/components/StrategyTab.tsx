import React, { useEffect, useState, useCallback } from 'react';
import { LogSummary } from '../types';
import { generateStrategy } from '../services/geminiService';
import { LoadingOverlay } from '../../../components/LoadingSpinner';

interface Props {
  data: LogSummary;
}

const StrategyTab: React.FC<Props> = ({ data }) => {
  const [strategy, setStrategy] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchStrategy = useCallback(
    async (isRegen = false) => {
      if (isRegen) setIsRegenerating(true);
      else setLoading(true);

      try {
        const result = await generateStrategy(data);
        setStrategy(result.markdown);
      } catch (e) {
        console.error(e);
        setStrategy('### Error\nFailed to generate strategy. Please try again.');
      } finally {
        setLoading(false);
        setIsRegenerating(false);
      }
    },
    [data]
  );

  useEffect(() => {
    fetchStrategy();
  }, [fetchStrategy]);

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## '))
        return (
          <h3
            key={i}
            className="text-2xl font-bold text-yellow-500 mt-8 mb-4 border-b border-gray-700 pb-2"
          >
            {line.replace('## ', '')}
          </h3>
        );
      if (line.startsWith('### '))
        return (
          <h4 key={i} className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2">
            ✨ {line.replace('### ', '')}
          </h4>
        );
      if (line.startsWith('- ') || line.startsWith('* '))
        return (
          <li key={i} className="ml-6 mb-2 text-gray-300 list-disc marker:text-yellow-500">
            {line.replace(/^[-*] /, '')}
          </li>
        );
      if (line.match(/^\d\./))
        return (
          <div key={i} className="ml-4 mb-2 font-medium text-gray-200">
            {line}
          </div>
        );
      if (line.trim() === '') return <br key={i} />;
      return (
        <p key={i} className="mb-3 text-gray-300 leading-relaxed max-w-4xl">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-900/30 p-2 rounded-full border border-purple-500/50">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white leading-none">AI Raid Strategist</h2>
            <p className="text-xs text-gray-500 mt-1">Generated based on combat log events</p>
          </div>
        </div>
        <button
          onClick={() => fetchStrategy(true)}
          disabled={loading || isRegenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-all disabled:opacity-50"
        >
          <span className={loading || isRegenerating ? 'animate-spin' : ''}>🔄</span>
          {loading || isRegenerating ? 'Consulting AI...' : 'Regenerate Strategy'}
        </button>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-8 overflow-y-auto relative min-h-[400px]">
        {loading ? (
          <LoadingOverlay
            size="xl"
            variant="arcane"
            message="Analyzing combat patterns..."
            subMessage="Identifying phases and mechanics"
          />
        ) : (
          <div
            className={`max-w-4xl mx-auto transition-opacity duration-300 ${isRegenerating ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}
          >
            {!import.meta.env.VITE_GEMINI_API_KEY && (
              <div className="mb-8 p-4 bg-yellow-900/10 border border-yellow-700/50 rounded-lg text-yellow-200 text-sm">
                <strong className="block mb-1 text-yellow-100">Demo Mode Active</strong>
                No API Key found. Configure VITE_GEMINI_API_KEY to unlock real-time Gemini analysis.
              </div>
            )}
            <div className="prose prose-invert max-w-none">
              {strategy ? (
                renderMarkdown(strategy)
              ) : (
                <div className="text-center py-20 text-gray-500">No strategy generated yet.</div>
              )}
            </div>
          </div>
        )}

        {isRegenerating && !loading && (
          <LoadingOverlay size="md" variant="arcane" message="Refining Strategy..." />
        )}
      </div>
    </div>
  );
};

export default StrategyTab;
