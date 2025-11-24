import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { WowIcon } from '../../components/icons/WowIcon.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/content', label: 'Content', icon: '📝' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen">
          <div className="p-6 border-b border-gray-800">
            <Link to="/" className="flex items-center gap-3 group">
              <WowIcon className="h-8 w-8 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-yellow-400">Admin Panel</h2>
                <p className="text-xs text-gray-500">WoW Class Helper</p>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
