import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Routes, Route, NavLink, Navigate, Link } from 'react-router-dom';
import { AppProvider, AppContext } from './contexts/AppContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { UserRole as GuildUserRole, AuthUser as GuildAuthUser } from './types';
import ApplyPage from './components/ApplyPage';
import AdminPage from './components/AdminPage';
import PerformanceAnalyzerPage from './components/PerformanceAnalyzerPage';
import GuildPerksPage from './components/GuildPerksPage';
import RosterPage from './components/RosterPage';
import GuildPage from './components/GuildPage';
import GuildSettingsPage from './components/GuildSettingsPage';
import CalendarPage from './components/CalendarPage';
import '../../styles/animations.css';

// --- Theme Context ---
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const userPrefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (userPrefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- Icons ---
const DiscordIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 640 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M524.531,69.836a1.5,1.5,0,0,0-2.121.121L460.488,160.635c-18.448-10.43-38.688-16.469-60.458-18.448-1.776-.16-3.312-.16-4.576,0-21.52,1.92-41.568,7.872-60.288,18.208L274.6,70.1a1.5,1.5,0,0,0-2.121-.121L223.363,114.16a1.5,1.5,0,0,0-.24,2.24l26.432,38.592c-18.976,12.064-36.256,27.328-50.816,45.376-1.5,1.824-.64,4.416,1.536,5.536L228.483,234c9.568,4.8,19.648,8.64,30.144,11.52,10.24,2.688,20.736,4.032,31.488,4.032s21.248-1.344,31.488-4.032c10.496-2.88,20.608-6.72,30.144-11.52l27.936-17.632a1.5,1.5,0,0,0,1.536-5.536c-14.56-18.048-31.84-33.312-50.816-45.376l26.432-38.592a1.5,1.5,0,0,0-.24-2.24L524.531,69.836ZM222.443,300.224c-11.776,0-21.504-10.976-21.504-24.544s9.728-24.544,21.504-24.544,21.504,10.976,21.504,24.544S234.219,300.224,222.443,300.224Zm195.112,0c-11.776,0-21.504-10.976-21.504-24.544s9.728-24.544,21.504-24.544,21.504,10.976,21.504,24.544S429.331,300.224,417.555,300.224Z"></path>
  </svg>
);
const ClipboardListIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 384 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M336 64h-88.6c.4-12.8 1.4-25.5 2.9-37.9 2.3-18.8-12.2-36.1-31.4-36.1H165.2c-19.1 0-33.7 17.3-31.4 36.1 1.5 12.5 2.5 25.2 2.9 37.9H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-64-48-64zM192 40c6.4 0 12.5 3.1 16.1 8.8 2.1 3.4 3.1 7.2 3.1 11.2 0 12.1-10.9 21.9-24 22-12.7.1-22-10.3-22-22 0-3.9 1-7.7 3.1-11.2 3.6-5.7 9.7-8.8 16.1-8.8zm128 408c0 4.4-3.6 8-8 8H72c-4.4 0-8-3.6-8-8V120c0-4.4 3.6-8 8-8h16v24c0 13.3 10.7 24 24 24h144c13.3 0 24-10.7 24-24v-24h16c4.4 0 8 3.6 8 8v328z"></path>
  </svg>
);
const GlobeIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 496 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-121.4-158-141.6 24.4 33.8 41.2 84.7 46.9 141.6h111.1zM17.3 160h111.1c5.7-56.9 22.5-107.8 46.9-141.6C103.8 38.6 45.9 92.1 17.3 160zM88 384c-15.9 0-31.3-1.8-46.1-5.1C10.7 371.1 0 361.6 0 349.4s5.8-23.2 15.1-33.1C24.4 306.3 35.8 304 48 304h40c12.2 0 23.6 2.3 34.9 6.2 21.3 7.5 39.8 18.9 54.9 33.3 22 21 34.3 49.3 34.3 78.5 0 2.9-.2 5.8-.5 8.7-29.2-11.1-62.8-17.7-99.6-17.7zm288 0c-36.8 0-70.4 6.6-99.6 17.7-.3-2.9-.5-5.8-.5-8.7 0-29.2 12.3-57.5 34.3-78.5 15.1-14.4 33.6-25.8 54.9-33.3 11.3-3.9 22.7-6.2 34.9-6.2h40c12.2 0 23.6 2.3 34.9 6.2 9.3 9.9 15.1 20.9 15.1 33.1s-10.7 21.7-31.9 29.5c-14.8 3.3-30.2 5.1-46.1 5.1z"></path>
  </svg>
);
const SunIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1z"></path>
  </svg>
);
const MoonIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"></path>
  </svg>
);

// --- UI Components ---
const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  return (
    <div
      className={`flex items-center space-x-1 p-1 rounded-md border ${theme === 'dark' ? 'bg-black/50 border-wow-gold-dark' : 'bg-wow-parchment-dark/50 border-wow-brown-light'}`}
    >
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs rounded-sm transition-all duration-200 ${language === 'en' ? 'bg-wow-gold text-wow-gray-900 font-bold shadow-gold-glow' : 'text-gray-600 dark:text-gray-400 hover:bg-wow-parchment-dark dark:hover:bg-wow-gray-700'}`}
      >
        EN
      </button>
      <div
        className={`w-px h-4 ${theme === 'dark' ? 'bg-wow-gold-dark' : 'bg-wow-brown-light'}`}
      ></div>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1 text-xs rounded-sm transition-all duration-200 ${language === 'es' ? 'bg-wow-gold text-wow-gray-900 font-bold shadow-gold-glow' : 'text-gray-600 dark:text-gray-400 hover:bg-wow-parchment-dark dark:hover:bg-wow-gray-700'}`}
      >
        ES
      </button>
    </div>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-black/50 text-wow-gold hover:bg-wow-gray-700' : 'bg-wow-parchment-dark/50 text-wow-brown-light hover:bg-wow-parchment-dark'}`}
      aria-label={t('toggle_theme')}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

const Header = () => {
  const { t } = useLanguage();
  const context = useContext(AppContext);
  const { isAuthenticated, logout: hubLogout } = useAuth();
  if (!context) return null;
  const { authenticatedUser } = context;

  const base = '/guild-manager';
  const logout = hubLogout;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm tracking-wider uppercase transition-all duration-200 hover:scale-105 ${
      isActive
        ? 'text-wow-brown-dark dark:text-wow-gold font-bold drop-shadow-[0_0_5px_rgba(240,185,10,0.7)]'
        : 'text-wow-brown dark:text-gray-300 hover:text-wow-brown-dark dark:hover:text-wow-gold'
    }`;

  return (
    <header
      className="bg-wow-parchment/80 dark:bg-wow-gray-900/80 backdrop-blur-sm border-b-4 border-wow-gold-dark font-cinzel text-wow-brown-dark dark:text-white sticky top-0 z-50 shadow-lg shadow-black/30"
      style={{
        borderImage: "url('https://wow.zamimg.com/images/wow/layout/header-border.png') 5 stretch",
      }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-sm text-wow-brown dark:text-gray-400 hover:text-wow-gold transition-colors rounded-md hover:bg-black/20"
            >
              <span>🏠</span>
              <span>Hub</span>
            </Link>
            <div className="w-px h-6 bg-wow-brown-light/30 dark:bg-gray-600"></div>
            <NavLink
              to={base}
              className="text-2xl md:text-3xl font-bold text-wow-brown-light dark:text-wow-gold hover:text-wow-brown-dark dark:hover:text-white transition-colors duration-300 tracking-widest hover:drop-shadow-[0_0_8px_rgba(139,69,19,0.5)] dark:hover:drop-shadow-[0_0_8px_rgba(240,185,10,0.8)]"
            >
              ETERNAL OATH
            </NavLink>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NavLink to={`${base}/apply`} className={navLinkClass}>
                  {t('header_apply')}
                </NavLink>
                <NavLink to={`${base}/roster`} className={navLinkClass}>
                  {t('header_roster')}
                </NavLink>
                <NavLink to={`${base}/calendar`} className={navLinkClass}>
                  {t('header_calendar')}
                </NavLink>
                <NavLink to={`${base}/analyzer`} className={navLinkClass}>
                  {t('header_analyzer')}
                </NavLink>
                <NavLink to={`${base}/guild`} className={navLinkClass}>
                  {t('header_guild')}
                </NavLink>
                {authenticatedUser && (
                  <div className="flex items-center space-x-2 pl-4 border-l border-wow-brown-light dark:border-gray-600">
                    <img
                      src={authenticatedUser.picture}
                      alt="user avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm">{authenticatedUser.name}</span>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm tracking-wider uppercase text-wow-brown dark:text-gray-300 hover:text-wow-brown-dark dark:hover:text-wow-gold"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link to="/login" className={navLinkClass({ isActive: false })}>
                {t('header_admin')}
              </Link>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  const context = useContext(AppContext);
  const mainGuild = context?.guilds.find((g) => g.id === 'g1');
  const linkClass =
    'hover:text-wow-brown-light dark:hover:text-wow-gold transition-all duration-300 flex items-center gap-2 hover:scale-110';

  return (
    <footer className="bg-wow-parchment-dark/80 dark:bg-wow-gray-900/80 backdrop-blur-sm mt-auto text-wow-brown dark:text-gray-400 font-cinzel p-4 border-t-2 border-wow-gold-dark">
      <div className="container mx-auto flex justify-between items-center text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Eternal Oath. {t('footer_rights')}
        </p>
        <div className="flex space-x-6">
          <a href="#" className={linkClass}>
            <DiscordIcon /> {t('footer_discord')}
          </a>
          <a
            href={mainGuild?.warcraftLogsUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <ClipboardListIcon /> {t('footer_warcraftlogs')}
          </a>
          <a
            href={mainGuild?.wowProgressUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <GlobeIcon /> {t('footer_wowprogress')}
          </a>
        </div>
      </div>
    </footer>
  );
};

/** Maps Hub roles to Guild roles */
const mapHubRoleToGuildRole = (hubRole: string): GuildUserRole => {
  switch (hubRole) {
    case 'admin':
      return GuildUserRole.ADMIN;
    case 'moderator':
      return GuildUserRole.OFFICER;
    case 'user':
    default:
      return GuildUserRole.MEMBER;
  }
};

/** Syncs Hub authentication with Guild's AppContext */
const HubAuthSync: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, userRole } = useAuth();
  const context = useContext(AppContext);

  useEffect(() => {
    if (context && isAuthenticated && user) {
      const guildUser: GuildAuthUser = {
        name: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        picture: `https://i.pravatar.cc/150?u=${user.id}`,
        role: mapHubRoleToGuildRole(userRole),
        guildId: 'g1',
        guildName: 'Eternal Oath',
      };
      context.setAuthenticatedUserFromHub(guildUser);
    } else if (context && !isAuthenticated) {
      context.setAuthenticatedUserFromHub(null);
    }
  }, [isAuthenticated, user, userRole, context]);

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-black/50 text-gray-200">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 animate-fade-in">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GuildPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/apply/:id?"
            element={
              <ProtectedRoute>
                <ApplyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roster"
            element={
              <ProtectedRoute>
                <RosterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perks"
            element={
              <ProtectedRoute>
                <GuildPerksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guild"
            element={
              <ProtectedRoute>
                <GuildPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guild/settings"
            element={
              <ProtectedRoute>
                <GuildSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyzer"
            element={
              <ProtectedRoute>
                <PerformanceAnalyzerPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function GuildManagerApp() {
  return (
    <AppProvider>
      <LanguageProvider>
        <ThemeProvider>
          <HubAuthSync>
            <AppContent />
          </HubAuthSync>
        </ThemeProvider>
      </LanguageProvider>
    </AppProvider>
  );
}
