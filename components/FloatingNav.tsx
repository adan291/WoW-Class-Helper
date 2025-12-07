import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const FloatingNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on hub page or login
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-2">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="p-3 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 border border-gray-600"
        aria-label="Go back"
        title="Atrás"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="p-3 bg-yellow-600/90 hover:bg-yellow-500 text-black rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-110 border border-yellow-500"
        aria-label="Go to home"
        title="Inicio"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </div>
  );
};
