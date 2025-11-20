import React from 'react';
import { ThemeProvider } from './ThemeContext.tsx';
import { AuthProvider } from './AuthContext.tsx';
import { I18nProvider } from './I18nContext.tsx';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          {children}
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
