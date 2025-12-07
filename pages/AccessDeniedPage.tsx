import React from 'react';
import { Link } from 'react-router-dom';
import { WowIcon } from '../components/icons/WowIcon.tsx';

export const AccessDeniedPage: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gray-950 text-gray-200 bg-cover bg-center bg-fixed flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')",
      }}
    >
      <div className="min-h-screen w-full bg-[#020617]/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <WowIcon className="h-24 w-24 text-red-500" />
          </div>
          <h1
            className="text-6xl font-black tracking-wider uppercase mb-4"
            style={{
              color: '#EF4444',
              textShadow: '0 0 10px #EF444440, 0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Access Denied
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            You don't have permission to access this page.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};
