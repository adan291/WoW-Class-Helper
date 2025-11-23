import React from 'react';
import { AuthProvider } from './AuthContext.tsx';
import { I18nProvider } from './I18nContext.tsx';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <I18nProvider>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
};
