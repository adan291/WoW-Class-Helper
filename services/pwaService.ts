/**
 * PWA Service
 * Manages Progressive Web App functionality
 */

export interface PWAConfig {
  enabled: boolean;
  offlineMode: boolean;
  cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  maxCacheSize: number; // in MB
  syncEnabled: boolean;
}

export interface PWAStats {
  isInstalled: boolean;
  isOnline: boolean;
  cacheSize: number;
  cachedItems: number;
  lastSync: number;
}

class PWAService {
  private readonly CONFIG_KEY = 'wow_class_helper_pwa_config';
  private readonly CACHE_NAME = 'wow-class-helper-v1';
  private config: PWAConfig = this.getDefaultConfig();
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.loadConfig();
    this.registerServiceWorker();
    this.setupListeners();
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Check if app is installable
   */
  isInstallable(): boolean {
    return 'beforeinstallprompt' in window;
  }

  /**
   * Prompt to install app
   */
  async promptInstall(): Promise<boolean> {
    const event = (window as any).deferredPrompt;
    if (!event) return false;

    event.prompt();
    const { outcome } = await event.userChoice;

    if (outcome === 'accepted') {
      (window as any).deferredPrompt = null;
      return true;
    }

    return false;
  }

  /**
   * Check if app is installed
   */
  isInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Enable offline mode
   */
  enableOfflineMode(): void {
    this.config.offlineMode = true;
    this.saveConfig();
  }

  /**
   * Disable offline mode
   */
  disableOfflineMode(): void {
    this.config.offlineMode = false;
    this.saveConfig();
  }

  /**
   * Set cache strategy
   */
  setCacheStrategy(strategy: PWAConfig['cacheStrategy']): void {
    this.config.cacheStrategy = strategy;
    this.saveConfig();
  }

  /**
   * Cache a resource
   */
  async cacheResource(url: string, response: Response): Promise<void> {
    try {
      const cache = await caches.open(this.CACHE_NAME);
      await cache.put(url, response.clone());
    } catch (error) {
      console.error('Failed to cache resource:', error);
    }
  }

  /**
   * Get cached resource
   */
  async getCachedResource(url: string): Promise<Response | undefined> {
    try {
      const cache = await caches.open(this.CACHE_NAME);
      return await cache.match(url);
    } catch (error) {
      console.error('Failed to get cached resource:', error);
      return undefined;
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize / (1024 * 1024); // Convert to MB
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * Get cached items count
   */
  async getCachedItemsCount(): Promise<number> {
    try {
      const cache = await caches.open(this.CACHE_NAME);
      const keys = await cache.keys();
      return keys.length;
    } catch (error) {
      console.error('Failed to get cached items count:', error);
      return 0;
    }
  }

  /**
   * Sync data
   */
  async syncData(): Promise<boolean> {
    if (!this.isOnline) {
      console.warn('Cannot sync: offline');
      return false;
    }

    try {
      // Implement sync logic here
      console.log('Syncing data...');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  /**
   * Get PWA stats
   */
  async getStats(): Promise<PWAStats> {
    return {
      isInstalled: this.isInstalled(),
      isOnline: this.isOnline,
      cacheSize: await this.getCacheSize(),
      cachedItems: await this.getCachedItemsCount(),
      lastSync: 0,
    };
  }

  /**
   * Get config
   */
  getConfig(): PWAConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(updates: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Export config
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import config
   */
  importConfig(json: string): boolean {
    try {
      const config: PWAConfig = JSON.parse(json);
      this.config = config;
      this.saveConfig();
      return true;
    } catch {
      return false;
    }
  }

  // Private helper methods

  private getDefaultConfig(): PWAConfig {
    return {
      enabled: true,
      offlineMode: true,
      cacheStrategy: 'stale-while-revalidate',
      maxCacheSize: 50,
      syncEnabled: true,
    };
  }

  private loadConfig(): void {
    try {
      const saved = localStorage.getItem(this.CONFIG_KEY);
      if (saved) {
        this.config = JSON.parse(saved);
      }
    } catch {
      this.config = this.getDefaultConfig();
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
    } catch {
      console.error('Failed to save PWA config');
    }
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App is online');
      if (this.config.syncEnabled) {
        this.syncData();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App is offline');
    });

    (window as any).addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      console.log('App installed');
      (window as any).deferredPrompt = null;
    });
  }
}

export const pwaService = new PWAService();
