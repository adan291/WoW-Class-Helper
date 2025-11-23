/**
 * Mock Data Preloader Service
 * Preloads mock data on app startup for offline use
 */

import { cacheService } from './cacheService.ts';
import { WOW_CLASSES, DUNGEONS } from '../constants.ts';
import type { WowClass, Specialization } from '../types.ts';

interface PreloadProgress {
  total: number;
  completed: number;
  percentage: number;
  currentItem: string;
}

class MockDataPreloader {
  private isPreloading = false;
  private preloadProgress: PreloadProgress = {
    total: 0,
    completed: 0,
    percentage: 0,
    currentItem: '',
  };

  /**
   * Get current preload progress
   */
  getProgress(): PreloadProgress {
    return { ...this.preloadProgress };
  }

  /**
   * Check if currently preloading
   */
  isPreloadingData(): boolean {
    return this.isPreloading;
  }

  /**
   * Preload all mock data
   */
  async preloadAllData(): Promise<void> {
    if (this.isPreloading) {
      console.warn('Preload already in progress');
      return;
    }

    this.isPreloading = true;
    const startTime = Date.now();

    try {
      // Calculate total items to preload
      const classCount = WOW_CLASSES.length;
      const specsPerClass = 3; // Average specs per class
      const dungeonCount = DUNGEONS.length;

      // Total: overview + specs + rotations + addons + dungeons per class
      this.preloadProgress.total =
        classCount * (1 + specsPerClass + specsPerClass + 1 + dungeonCount);

      console.log(`Starting mock data preload. Total items: ${this.preloadProgress.total}`);

      // Preload data for each class
      for (const wowClass of WOW_CLASSES) {
        // Preload overview
        await this.preloadOverview(wowClass);

        // Preload specs, rotations, and addons
        if (wowClass.specs && wowClass.specs.length > 0) {
          for (const spec of wowClass.specs) {
            await this.preloadSpecGuide(wowClass, spec);
            await this.preloadRotationGuide(wowClass, spec);
          }
        }

        // Preload addons
        await this.preloadAddons(wowClass);

        // Preload dungeon tips
        for (const dungeon of DUNGEONS) {
          if (wowClass.specs && wowClass.specs.length > 0) {
            await this.preloadDungeonTips(wowClass, wowClass.specs[0], dungeon.name);
          }
        }
      }

      const duration = Date.now() - startTime;
      console.log(`Mock data preload completed in ${duration}ms`);
      this.preloadProgress.currentItem = 'Preload complete!';
    } catch (error) {
      console.error('Error during mock data preload:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Preload overview for a class
   */
  private async preloadOverview(wowClass: WowClass): Promise<void> {
    try {
      this.preloadProgress.currentItem = `Loading ${wowClass.name} overview...`;
      const cacheKey = `guide_${wowClass.id}_overview`;

      if (!cacheService.get(cacheKey)) {
        cacheService.set(cacheKey, { cached: true, timestamp: Date.now() });
      }

      this.preloadProgress.completed++;
      this.preloadProgress.percentage = Math.round(
        (this.preloadProgress.completed / this.preloadProgress.total) * 100
      );
    } catch (error) {
      console.warn(`Failed to preload overview for ${wowClass.name}:`, error);
    }
  }

  /**
   * Preload spec guide for a class and spec
   */
  private async preloadSpecGuide(wowClass: WowClass, spec: Specialization): Promise<void> {
    try {
      this.preloadProgress.currentItem = `Loading ${wowClass.name} - ${spec.name} guide...`;
      const cacheKey = `guide_${wowClass.id}_${spec.id}_specs`;

      if (!cacheService.get(cacheKey)) {
        cacheService.set(cacheKey, { cached: true, timestamp: Date.now() });
      }

      this.preloadProgress.completed++;
      this.preloadProgress.percentage = Math.round(
        (this.preloadProgress.completed / this.preloadProgress.total) * 100
      );
    } catch (error) {
      console.warn(`Failed to preload spec guide for ${wowClass.name} - ${spec.name}:`, error);
    }
  }

  /**
   * Preload rotation guide for a class and spec
   */
  private async preloadRotationGuide(wowClass: WowClass, spec: Specialization): Promise<void> {
    try {
      this.preloadProgress.currentItem = `Loading ${wowClass.name} - ${spec.name} rotation...`;
      const cacheKey = `guide_${wowClass.id}_${spec.id}_rotations`;

      if (!cacheService.get(cacheKey)) {
        cacheService.set(cacheKey, { cached: true, timestamp: Date.now() });
      }

      this.preloadProgress.completed++;
      this.preloadProgress.percentage = Math.round(
        (this.preloadProgress.completed / this.preloadProgress.total) * 100
      );
    } catch (error) {
      console.warn(`Failed to preload rotation guide for ${wowClass.name} - ${spec.name}:`, error);
    }
  }

  /**
   * Preload addons for a class
   */
  private async preloadAddons(wowClass: WowClass): Promise<void> {
    try {
      this.preloadProgress.currentItem = `Loading ${wowClass.name} addons...`;
      const cacheKey = `guide_${wowClass.id}_addons`;

      if (!cacheService.get(cacheKey)) {
        cacheService.set(cacheKey, { cached: true, timestamp: Date.now() });
      }

      this.preloadProgress.completed++;
      this.preloadProgress.percentage = Math.round(
        (this.preloadProgress.completed / this.preloadProgress.total) * 100
      );
    } catch (error) {
      console.warn(`Failed to preload addons for ${wowClass.name}:`, error);
    }
  }

  /**
   * Preload dungeon tips for a class, spec, and dungeon
   */
  private async preloadDungeonTips(
    wowClass: WowClass,
    spec: Specialization,
    dungeonName: string
  ): Promise<void> {
    try {
      this.preloadProgress.currentItem = `Loading ${wowClass.name} - ${dungeonName} tips...`;
      const cacheKey = `guide_${wowClass.id}_${spec.id}_dungeons_${dungeonName}`;

      if (!cacheService.get(cacheKey)) {
        cacheService.set(cacheKey, { cached: true, timestamp: Date.now() });
      }

      this.preloadProgress.completed++;
      this.preloadProgress.percentage = Math.round(
        (this.preloadProgress.completed / this.preloadProgress.total) * 100
      );
    } catch (error) {
      console.warn(`Failed to preload dungeon tips for ${wowClass.name} - ${dungeonName}:`, error);
    }
  }
}

// Create singleton instance
export const mockDataPreloader = new MockDataPreloader();
