import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/authContextValue.ts';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Re-export type for convenience
export type { AuthContextType } from '../contexts/authContextValue.ts';
