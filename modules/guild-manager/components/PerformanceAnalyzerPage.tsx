import React, { useState, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyzeLog } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { AnalysisResult } from '../types';
import { WOW_CLASSES } from '../constants';
import { LoadingOverlayEnhanced } from '../../../components/LoadingOverlayEnhanced';

const AbilityUsageChart: React.FC<{
  data: { abilityName: string; casts: number }[];
  barColor: string;
}> = ({ data, barColor }) => {
  const { t } = useLanguage();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
        <XAxis dataKey="abilityName" tick={{ fill: '#a0a0a0' }} />
        <YAxis tick={{ fill: '#a0a0a0' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #4a4a4a' }}
          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
        />
        <Legend wrapperStyle={{ color: '#f0f0f0' }} />
        <Bar dataKey="casts" fill={barColor} name={t('analyzer_chart_casts')} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default function PerformanceAnalyzerPage() {
  const { t, language } = useLanguage();
  const [logUrl, setLogUrl] = useState('');
  const [logFileContent, setLogFileContent] = useState('');
  const [playerClass, setPlayerClass] = useState('');
  const [playerSpec, setPlayerSpec] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogFileContent(event.target?.result as string);
        setLogUrl('');
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!logUrl && !logFileContent) || !playerClass || !playerSpec) {
      setError(t('analyzer_error_general'));
      return;
    }
    setError('');
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeLog(playerClass, playerSpec, logUrl || logFileContent, language);
      setAnalysisResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('analyzer_error_fetch'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (printRef.current) window.print();
  };

  const specs = WOW_CLASSES.find((c) => c.name === playerClass)?.specs || [];
  const classData = WOW_CLASSES.find((c) => c.name === playerClass);

  return (
    <div className="font-cinzel">
      <div className="wow-panel">
        <h1 className="text-3xl md:text-4xl font-bold text-wow-gold text-center tracking-wider">
          {t('analyzer_header')}
        </h1>
        <p className="text-center text-gray-300 mt-2 mb-8">{t('analyzer_subheader')}</p>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={playerClass}
              onChange={(e) => {
                setPlayerClass(e.target.value);
                setPlayerSpec('');
              }}
              className="wow-input w-full"
            >
              <option value="">{t('analyzer_selectClass')}</option>
              {WOW_CLASSES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={playerSpec}
              onChange={(e) => setPlayerSpec(e.target.value)}
              disabled={!playerClass}
              className="wow-input w-full"
            >
              <option value="">{t('analyzer_selectSpec')}</option>
              {specs.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="url"
            placeholder={t('analyzer_logUrl')}
            value={logUrl}
            onChange={(e) => {
              setLogUrl(e.target.value);
              setLogFileContent('');
            }}
            className="w-full wow-input"
          />
          <div className="text-center text-gray-400">{t('analyzer_or')}</div>
          <input
            type="file"
            accept=".txt,.json"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-wow-blue file:text-white hover:file:bg-wow-blue-dark"
          />

          <div className="text-center pt-4">
            <button type="submit" disabled={isLoading} className="wow-button">
              {isLoading ? t('analyzer_analyzing') : t('analyzer_submit')}
            </button>
          </div>
        </form>
      </div>

      <LoadingOverlayEnhanced
        isVisible={isLoading}
        message={t('analyzer_loading')}
        subMessage={t('analyzer_analyzing')}
        variant="gold"
        fullScreen={true}
      />

      <div className="mt-8">
        {error && (
          <div className="bg-red-900/50 text-red-100 p-6 rounded-md border border-red-500 text-center animate-fade-in shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {analysisResult && (
          <div ref={printRef} className="wow-panel space-y-6">
            <div className="flex justify-between items-start">
              <h2
                className="text-3xl font-bold tracking-wider"
                style={{ color: classData?.color || '#FFFFFF' }}
              >
                {playerSpec} {playerClass} {t('analyzer_report_header')}
              </h2>
              <button onClick={handleDownloadPdf} className="wow-button print:hidden !py-2 !px-4">
                {t('analyzer_download_pdf')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-wow-gray-900 p-4 rounded-md border border-wow-gray-700 transition-shadow hover:shadow-gold-glow">
                <p className="text-sm text-gray-400">{t('analyzer_summary_avgDps')}</p>
                <p className="text-2xl font-bold text-wow-gold">
                  {analysisResult.summary.averageDps.toLocaleString()}
                </p>
              </div>
              <div className="bg-wow-gray-900 p-4 rounded-md border border-wow-gray-700 transition-shadow hover:shadow-gold-glow">
                <p className="text-sm text-gray-400">
                  {analysisResult.summary.primaryAbilityName} {t('analyzer_summary_uptime')}
                </p>
                <p className="text-2xl font-bold text-wow-gold">
                  {analysisResult.summary.primaryAbilityUptimePercent}%
                </p>
              </div>
              <div className="bg-wow-gray-900 p-4 rounded-md border border-wow-gray-700 transition-shadow hover:shadow-gold-glow">
                <p className="text-sm text-gray-400">{t('analyzer_summary_performance')}</p>
                <p className="text-2xl font-bold text-wow-gold">
                  Top {100 - analysisResult.comparison.percentile}%
                </p>
              </div>
              <div className="bg-wow-gray-900 p-4 rounded-md border border-wow-gray-700 transition-shadow hover:shadow-gold-glow">
                <p className="text-sm text-gray-400">{t('analyzer_summary_downtime')}</p>
                <p className="text-2xl font-bold text-wow-gold">
                  {analysisResult.chartsData.downtimePercent}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-wow-gray-900 p-4 rounded-md border border-wow-gray-700">
                <h3 className="text-xl font-bold text-wow-gold mb-3">
                  {t('analyzer_chart_abilityUsage')}
                </h3>
                <AbilityUsageChart
                  data={analysisResult.chartsData.abilityUsage}
                  barColor={classData?.color || '#8884d8'}
                />
              </div>
              <div className="bg-wow-gray-900 p-4 rounded-md border border-wow-gray-700 space-y-3">
                <h3 className="text-xl font-bold text-wow-gold mb-3">
                  {t('analyzer_commonErrors')}
                </h3>
                <ul className="list-disc list-inside text-red-300 space-y-1">
                  {analysisResult.commonErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
                <h3 className="text-xl font-bold text-wow-gold pt-3">{t('analyzer_comparison')}</h3>
                <p className="text-gray-300 italic">"{analysisResult.comparison.comment}"</p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-wow-gold text-center mb-4">
                {t('analyzer_recommendations')}
              </h3>
              <div className="space-y-4">
                {analysisResult.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="bg-wow-gray-900 p-4 rounded-md border border-wow-gray-700 flex items-center gap-4"
                  >
                    <img
                      src={rec.spellIconUrl}
                      alt="spell icon"
                      className="w-12 h-12 rounded-lg border-2 border-wow-gray-600 flex-shrink-0"
                    />
                    <p className="text-gray-300">{rec.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media print {
          body { background: #1a1a1a !important; }
          .print\\:hidden { display: none; }
          header, footer, form { display: none; }
          main { padding: 0 !important; }
          .wow-panel { box-shadow: none !important; border: 1px solid #4a4a4a !important; background: #1a1a1a !important; backdrop-filter: none !important; }
        }
      `}</style>
    </div>
  );
}
