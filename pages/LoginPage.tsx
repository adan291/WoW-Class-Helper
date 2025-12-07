import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm.tsx';
import { RegisterForm } from '../components/auth/RegisterForm.tsx';
import { PasswordResetForm } from '../components/auth/PasswordResetForm.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { WowIcon } from '../components/icons/WowIcon.tsx';

type TabType = 'login' | 'register' | 'reset';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen bg-gray-950 text-gray-200 bg-cover bg-center bg-fixed flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop')",
      }}
    >
      <div className="min-h-screen w-full bg-[#020617]/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors mb-6 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="flex justify-center mb-4 group cursor-pointer">
                <WowIcon className="h-16 w-16 text-yellow-400 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]" />
              </div>
            </Link>
            <Link to="/">
              <h1
                className="text-4xl font-black tracking-wider uppercase cursor-pointer hover:text-yellow-300 transition-colors"
                style={{
                  color: '#FFD700',
                  textShadow: '0 0 15px #FFD70050, 0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                WoW AI Hub
              </h1>
            </Link>
            <p className="text-gray-300 mt-2 font-medium">Your ultimate WoW companion</p>
          </div>

          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-yellow-500/30 overflow-hidden">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 px-4 font-bold text-lg transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 px-4 font-bold text-lg transition-all duration-200 ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'login' && <LoginForm />}
              {activeTab === 'register' && <RegisterForm />}
              {activeTab === 'reset' && <PasswordResetForm />}

              {activeTab === 'login' && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setActiveTab('reset')}
                    className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors font-medium underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {activeTab === 'reset' && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors font-medium underline underline-offset-2"
                  >
                    ← Back to login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
