import React from 'react';
import { AuthProvider } from './AuthContext.tsx';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
