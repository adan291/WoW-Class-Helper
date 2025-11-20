
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
import { mockDataPreloader } from './services/mockDataPreloader.ts';
import './styles/animations.css';

const AppContent = () => {
  const [selectedClass, setSelectedClass] = useState<WowClass | null>(null);
  const { userRole, setUserRole } = useAuth();

  // Preload mock data on app startup
  useEffect(() => {
    mockDataPreloader.preloadAllData().catch(error => {
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
      <FallbackStatusBar />
      <div className="min-h-screen bg-gray-900 text-gray-200 bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')"}}>
        <div className="min-h-screen bg-gray-900 bg-opacity-80 backdrop-blur-sm">
          <header className="py-4 px-6 flex items-center justify-between border-b-2 shadow-lg bg-gray-900 bg-opacity-50 smooth-transition" style={{borderColor: '#FFD700'}}>
            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: '#FFD70040'}} />
                <WowIcon className="h-10 w-10 text-yellow-400 relative transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="relative">
                <h1 
                  className="text-3xl font-black tracking-wider uppercase transition-all duration-300 group-hover:text-yellow-300"
                  style={{
                    color: '#FFD700',
                    textShadow: '0 0 10px #FFD70040, 0 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  WoW AI Class Helper
                </h1>
              </div>
            </div>
            <div className="relative">
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-gray-800 border-2 border-gray-600 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 appearance-none smooth-transition hover:border-yellow-500"
                style={{
                  boxShadow: userRole === 'admin' ? '0 0 15px #FFD70060' : 'none'
                }}
              >
                <option value="user">👤 User Mode</option>
                <option value="master">👑 Master Mode</option>
                <option value="admin">⚙️ Admin Mode</option>
              </select>
            </div>
          </header>
          <main className="p-4 md:p-8">
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
