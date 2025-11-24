import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.ts';
import { WowIcon } from '../components/icons/WowIcon.tsx';

const MIN_PASSWORD_LENGTH = 6;

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    return null;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <WowIcon className="h-16 w-16 text-yellow-400" />
            </div>
            <h1
              className="text-4xl font-black tracking-wider uppercase"
              style={{
                color: '#FFD700',
                textShadow: '0 0 10px #FFD70040, 0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Reset Password
            </h1>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl border border-yellow-500/20 p-6">
            {success ? (
              <div className="text-center space-y-4">
                <div className="text-green-500 text-lg font-semibold">✓ Password Updated!</div>
                <p className="text-gray-400 text-sm">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                    required
                    minLength={6}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
