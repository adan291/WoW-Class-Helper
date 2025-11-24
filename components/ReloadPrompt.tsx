import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useI18n } from '../contexts/I18nContext.tsx';

export const ReloadPrompt: React.FC = () => {
    const { t } = useI18n();
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-gray-800 border border-yellow-500 rounded-lg shadow-lg max-w-sm animate-fade-in">
            <div className="mb-2 text-white">
                {offlineReady ? (
                    <span>{t('pwa.offlineReady') || 'App ready to work offline'}</span>
                ) : (
                    <span>{t('pwa.newContent') || 'New content available, click on reload button to update.'}</span>
                )}
            </div>
            <div className="flex gap-2 mt-2">
                {needRefresh && (
                    <button
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-500 transition-colors text-sm"
                        onClick={() => updateServiceWorker(true)}
                    >
                        {t('pwa.reload') || 'Reload'}
                    </button>
                )}
                <button
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
                    onClick={close}
                >
                    {t('common.close') || 'Close'}
                </button>
            </div>
        </div>
    );
};
