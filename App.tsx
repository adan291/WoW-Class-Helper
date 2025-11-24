import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { WowClass } from './types.ts';
import ClassSelection from './components/ClassSelection.tsx';
import ClassHub from './components/ClassHub.tsx';
import { WowIcon } from './components/icons/WowIcon.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { FallbackStatusBar } from './components/FallbackStatusBar.tsx';
import { useAuth } from './hooks/useAuth.ts';
import { useI18n, type Language } from './contexts/I18nContext.tsx';
import { mockDataPreloader } from './services/mockDataPreloader.ts';
import { ReloadPrompt } from './components/ReloadPrompt.tsx';
import { SkipLink } from './components/SkipLink.tsx';
import { CanAccess } from './components/CanAccess.tsx';
import './styles/animations.css';

const App = () => {
  const [selectedClass, setSelectedClass] = useState<WowClass | null>(null);
  const { userRole, setUserRole, isAuthenticated } = useAuth();
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
            <Link to="/" className="flex items-center gap-4 group cursor-pointer">
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
            </Link>
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

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-600"
                  >
                    👤 Profile
                  </Link>
                  <CanAccess permission="view_admin_dashboard">
                    <Link
                      to="/admin"
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      ⚙️ Admin
                    </Link>
                  </CanAccess>
                </>
              ) : (
                <>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as 'user' | 'master' | 'admin')}
                    className="bg-gray-800 border-2 border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 appearance-none smooth-transition hover:border-yellow-500"
                    style={{
                      boxShadow: userRole === 'admin' ? '0 0 15px #FFD70060' : 'none',
                    }}
                    aria-label="Select User Role"
                  >
                    <option value="user">👤 {t('role.user')}</option>
                    <option value="master">👑 {t('role.master')}</option>
                    <option value="admin">⚙️ {t('role.admin')}</option>
                  </select>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
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

export default App;
