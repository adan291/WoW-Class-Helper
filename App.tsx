import { useState, useEffect } from 'react';
import type { WowClass, UserRole } from './types.ts';
import ClassSelection from './components/ClassSelection.tsx';
import ClassHub from './components/ClassHub.tsx';
import { WowIcon } from './components/icons/WowIcon.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { FallbackStatusBar } from './components/FallbackStatusBar.tsx';
import { AppProviders } from './contexts/AppProviders.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { useI18n, Language } from './contexts/I18nContext.tsx';
import { mockDataPreloader } from './services/mockDataPreloader.ts';
import { ReloadPrompt } from './components/ReloadPrompt.tsx';
import { SkipLink } from './components/SkipLink.tsx';
import './styles/animations.css';

const AppContent = () => {
  const [selectedClass, setSelectedClass] = useState<WowClass | null>(null);
  const { userRole, setUserRole } = useAuth();
  const { language, setLanguage, t } = useI18n();

  // Preload mock data on app startup
  useEffect(() => {
    mockDataPreloader.preloadAllData().catch((error) => {
      console.error('Failed to preload mock data:', error);
    });
  }, []);

  const handleSelectClass = (wowClass: WowClass) => {
    setSelectedClass(wowClass);
  };

  const handleGoBack = () => {
    setSelectedClass(null);
  };

  return (
    <ErrorBoundary>
      <SkipLink />
      <FallbackStatusBar />
      <ReloadPrompt />
      <div
        className="min-h-screen bg-gray-950 text-gray-200 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')",
        }}
      >
        <div className="min-h-screen bg-[#020617]/90 backdrop-blur-sm">
          <header
            className="py-4 px-6 flex items-center justify-between border-b border-white/10 shadow-2xl glass-effect sticky top-0 z-50 transition-all duration-300"
            style={{ borderColor: 'rgba(255, 215, 0, 0.2)' }}
          >
            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: '#FFD70040' }}
                />
                <WowIcon className="h-10 w-10 text-yellow-400 relative transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="relative">
                <h1
                  className="text-3xl font-black tracking-wider uppercase transition-all duration-300 group-hover:text-yellow-300"
                  style={{
                    color: '#FFD700',
                    textShadow: '0 0 10px #FFD70040, 0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  WoW AI Class Helper
                </h1>
                <p className="text-xs text-yellow-500/80 font-mono tracking-widest uppercase ml-1">
                  {t('app.description')}
                </p>
              </div>
            </div>
            <div className="relative flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-gray-800 border-2 border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 appearance-none smooth-transition hover:border-yellow-500 w-20"
                aria-label="Select Language"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="de">🇩🇪 DE</option>
                <option value="pt">🇧🇷 PT</option>
                <option value="ja">🇯🇵 JA</option>
                <option value="zh">🇨🇳 ZH</option>
              </select>

              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-gray-800 border-2 border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 appearance-none smooth-transition hover:border-yellow-500"
                style={{
                  boxShadow: userRole === 'admin' ? '0 0 15px #FFD70060' : 'none'
                }}
                aria-label="Select User Role"
              >
                <option value="user">👤 {t('role.user')}</option>
                <option value="master">👑 {t('role.master')}</option>
                <option value="admin">⚙️ {t('role.admin')}</option>
              </select>
            </div>
          </header>
          <main id="main-content" className="p-4 md:p-8" tabIndex={-1}>
            {selectedClass ? (
              <ClassHub wowClass={selectedClass} onGoBack={handleGoBack} userRole={userRole} />
            ) : (
              <ClassSelection onSelectClass={handleSelectClass} />
            )}
          </main>
        </div>
      </div>
      <ToastContainer />
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;
