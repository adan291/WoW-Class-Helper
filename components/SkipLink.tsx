import React from 'react';
import { useI18n } from '../contexts/I18nContext.tsx';

export const SkipLink: React.FC = () => {
  const { t } = useI18n();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:font-bold focus:rounded-lg focus:shadow-lg transition-all"
    >
      {t('a11y.skipToContent') || 'Skip to main content'}
    </a>
  );
};
