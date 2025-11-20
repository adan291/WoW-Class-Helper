/**
 * Data Curator System
 * 
 * Manages class data validation, source verification, and patch updates.
 * Each class has a curator that ensures data accuracy before being used by Gemini.
 */

import type { Specialization } from '../types.ts';

export interface DataSource {
  name: string;
  url: string;
  priority: number; // 1 = highest priority
  lastChecked: Date;
  isActive: boolean;
}

export interface ClassDataMetadata {
  classId: string;
  className: string;
  lastUpdated: Date;
  patchVersion: string;
  sources: DataSource[];
  dataIntegrity: number; // 0-100 confidence score
  validationStatus: 'valid' | 'outdated' | 'needs_review' | 'error';
  notes: string[];
}

export interface SpecializationData {
  spec: Specialization;
  statPriority: string[];
  keyAbilities: string[];
  lastValidated: Date;
  sourceUrls: string[];
}

export interface CuratorReport {
  classId: string;
  className: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  nextCheckDue: Date;
}

/**
 * Primary data sources for WoW class information
 * Ordered by reliability and update frequency
 */
export const PRIMARY_SOURCES: Record<string, DataSource[]> = {
  official: [
    {
      name: 'Blizzard Official Patch Notes',
      url: 'https://www.wowhead.com/patch-notes',
      priority: 1,
      lastChecked: new Date(),
      isActive: true,
    },
    {
      name: 'WoW Class Forums',
      url: 'https://us.forums.blizzard.com/en/wow/c/classes/',
      priority: 2,
      lastChecked: new Date(),
      isActive: true,
    },
  ],
  community: [
    {
      name: 'Wowhead Class Guides',
      url: 'https://www.wowhead.com/guides/classes',
      priority: 3,
      lastChecked: new Date(),
      isActive: true,
    },
    {
      name: 'Icy Veins Guides',
      url: 'https://www.icy-veins.com/wow/',
      priority: 4,
      lastChecked: new Date(),
      isActive: true,
    },
  ],
  specialized: [
    {
      name: 'Method Guides',
      url: 'https://www.method.gg/guides',
      priority: 5,
      lastChecked: new Date(),
      isActive: true,
    },
    {
      name: 'Raider.io Community',
      url: 'https://raider.io/mythic-plus/guides',
      priority: 6,
      lastChecked: new Date(),
      isActive: true,
    },
  ],
};

/**
 * Class-specific curator configuration
 */
export const CLASS_CURATOR_CONFIG: Record<string, ClassDataMetadata> = {
  warrior: {
    classId: 'warrior',
    className: 'Warrior',
    lastUpdated: new Date(),
    patchVersion: '11.0.0',
    sources: PRIMARY_SOURCES.official.concat(PRIMARY_SOURCES.community),
    dataIntegrity: 95,
    validationStatus: 'valid',
    notes: [
      'Arms and Fury specs are primary DPS specs',
      'Protection is the tank spec',
      'Warrior is a melee-only class',
    ],
  },
  paladin: {
    classId: 'paladin',
    className: 'Paladin',
    lastUpdated: new Date(),
    patchVersion: '11.0.0',
    sources: PRIMARY_SOURCES.official.concat(PRIMARY_SOURCES.community),
    dataIntegrity: 92,
    validationStatus: 'valid',
    notes: [
      'Holy and Protection are support specs',
      'Retribution is the primary DPS spec',
      'Paladin has strong utility and survivability',
    ],
  },
  // Add more classes as needed
};

/**
 * Validates if class data is current and accurate
 */
export const validateClassData = (classId: string): CuratorReport => {
  const config = CLASS_CURATOR_CONFIG[classId];
  
  if (!config) {
    return {
      classId,
      className: 'Unknown',
      timestamp: new Date(),
      status: 'critical',
      issues: [`No curator configuration found for class: ${classId}`],
      recommendations: ['Create curator configuration for this class'],
      nextCheckDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if data is outdated (older than 7 days)
  const daysSinceUpdate = (Date.now() - config.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate > 7) {
    issues.push(`Data not updated for ${Math.floor(daysSinceUpdate)} days`);
    recommendations.push('Schedule data refresh from primary sources');
  }

  // Check data integrity score
  if (config.dataIntegrity < 80) {
    issues.push(`Low data integrity score: ${config.dataIntegrity}%`);
    recommendations.push('Review and validate data against primary sources');
  }

  // Check source availability
  const inactiveSources = config.sources.filter(s => !s.isActive);
  if (inactiveSources.length > 0) {
    issues.push(`${inactiveSources.length} data sources are inactive`);
    recommendations.push('Verify and reactivate inactive sources');
  }

  const status = issues.length === 0 ? 'healthy' : issues.length > 2 ? 'critical' : 'warning';

  return {
    classId: config.classId,
    className: config.className,
    timestamp: new Date(),
    status,
    issues,
    recommendations,
    nextCheckDue: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
};

/**
 * Gets verified source URLs for a specific class
 */
export const getVerifiedSources = (classId: string): string[] => {
  const config = CLASS_CURATOR_CONFIG[classId];
  
  if (!config) {
    return [];
  }

  return config.sources
    .filter(source => source.isActive)
    .sort((a, b) => a.priority - b.priority)
    .map(source => source.url);
};

/**
 * Updates curator metadata for a class
 */
export const updateClassCuratorData = (
  classId: string,
  updates: Partial<ClassDataMetadata>
): ClassDataMetadata | null => {
  const config = CLASS_CURATOR_CONFIG[classId];
  
  if (!config) {
    console.error(`No curator configuration found for class: ${classId}`);
    return null;
  }

  const updated = {
    ...config,
    ...updates,
    lastUpdated: new Date(),
  };

  CLASS_CURATOR_CONFIG[classId] = updated;
  return updated;
};

/**
 * Generates a comprehensive curator report for all classes
 */
export const generateCuratorReport = (): CuratorReport[] => {
  return Object.keys(CLASS_CURATOR_CONFIG).map(classId => 
    validateClassData(classId)
  );
};

/**
 * Checks if a class needs data refresh based on patch version
 */
export const needsDataRefresh = (classId: string, currentPatchVersion: string): boolean => {
  const config = CLASS_CURATOR_CONFIG[classId];
  
  if (!config) {
    return true;
  }

  // If patch version changed, data needs refresh
  if (config.patchVersion !== currentPatchVersion) {
    return true;
  }

  // If data is older than 7 days, refresh
  const daysSinceUpdate = (Date.now() - config.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > 7;
};
