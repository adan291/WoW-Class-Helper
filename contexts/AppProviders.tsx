import React from 'react';
import { ThemeProvider } from './ThemeContext.tsx';
import { AuthProvider } from './AuthContext.tsx';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
};
