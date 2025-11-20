/**
 * Patch Monitor Service
 * 
 * Tracks WoW patch updates and flags classes/specs that need data refresh.
 * Ensures guides are always based on current patch information.
 */

export interface PatchInfo {
  version: string;
  releaseDate: Date;
  expansion: string;
  majorChanges: string[];
  affectedClasses: string[];
  affectedSpecs: string[];
}

export interface PatchCheckResult {
  currentPatch: string;
  previousPatch: string;
  hasNewPatch: boolean;
  affectedClasses: string[];
  affectedSpecs: string[];
  recommendations: string[];
}

/**
 * Known patch history for WoW
 * This should be updated as new patches are released
 */
export const PATCH_HISTORY: PatchInfo[] = [
  {
    version: '11.0.0',
    releaseDate: new Date('2024-11-19'),
    expansion: 'The War Within',
    majorChanges: [
      'Class balance adjustments',
      'Mythic+ tuning',
      'Talent tree updates',
    ],
    affectedClasses: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'monk', 'druid', 'demon_hunter', 'death_knight', 'evoker'],
    affectedSpecs: ['all'],
  },
  {
    version: '10.2.7',
    releaseDate: new Date('2024-10-15'),
    expansion: 'Dragonflight',
    majorChanges: [
      'Mythic+ adjustments',
      'Raid balance changes',
    ],
    affectedClasses: ['warrior', 'mage', 'warlock'],
    affectedSpecs: ['arms', 'fury', 'arcane', 'fire', 'frost_mage', 'affliction', 'demonology', 'destruction'],
  },
];

/**
 * Current active patch version
 * This should be updated when new patches are released
 */
let CURRENT_PATCH_VERSION = '11.0.0';

/**
 * Gets the current active patch version
 */
export const getCurrentPatchVersion = (): string => {
  return CURRENT_PATCH_VERSION;
};

/**
 * Updates the current patch version
 * Should be called when a new patch is released
 */
export const updateCurrentPatchVersion = (newVersion: string): void => {
  CURRENT_PATCH_VERSION = newVersion;
  console.log(`Patch version updated to: ${newVersion}`);
};

/**
 * Gets patch information for a specific version
 */
export const getPatchInfo = (version: string): PatchInfo | undefined => {
  return PATCH_HISTORY.find(p => p.version === version);
};

/**
 * Gets the most recent patch
 */
export const getLatestPatch = (): PatchInfo => {
  return PATCH_HISTORY[0];
};

/**
 * Checks if a class was affected by the latest patch
 */
export const wasClassAffectedByLatestPatch = (classId: string): boolean => {
  const latestPatch = getLatestPatch();
  return latestPatch.affectedClasses.includes(classId) || 
         latestPatch.affectedClasses.includes('all');
};

/**
 * Checks if a spec was affected by the latest patch
 */
export const wasSpecAffectedByLatestPatch = (specId: string): boolean => {
  const latestPatch = getLatestPatch();
  return latestPatch.affectedSpecs.includes(specId) || 
         latestPatch.affectedSpecs.includes('all');
};

/**
 * Performs a patch check and returns affected classes/specs
 */
export const checkForPatchUpdates = (previousPatch: string): PatchCheckResult => {
  const currentPatch = getCurrentPatchVersion();
  const hasNewPatch = previousPatch !== currentPatch;

  let affectedClasses: string[] = [];
  let affectedSpecs: string[] = [];
  const recommendations: string[] = [];

  if (hasNewPatch) {
    const patchInfo = getPatchInfo(currentPatch);
    if (patchInfo) {
      affectedClasses = patchInfo.affectedClasses;
      affectedSpecs = patchInfo.affectedSpecs;

      recommendations.push(`New patch released: ${currentPatch}`);
      recommendations.push(`Affected classes: ${affectedClasses.join(', ')}`);
      
      if (patchInfo.majorChanges.length > 0) {
        recommendations.push(`Major changes: ${patchInfo.majorChanges.join(', ')}`);
      }

      recommendations.push('Update guides for affected classes and specs');
    }
  }

  return {
    currentPatch,
    previousPatch,
    hasNewPatch,
    affectedClasses,
    affectedSpecs,
    recommendations,
  };
};

/**
 * Gets all patches that have been released since a specific version
 */
export const getPatchesSince = (version: string): PatchInfo[] => {
  const startIndex = PATCH_HISTORY.findIndex(p => p.version === version);
  if (startIndex === -1) {
    return [];
  }
  return PATCH_HISTORY.slice(0, startIndex);
};

/**
 * Generates a patch update report
 */
export const generatePatchReport = (): {
  timestamp: Date;
  currentPatch: string;
  latestPatch: PatchInfo;
  totalPatches: number;
  recommendations: string[];
} => {
  const currentPatch = getCurrentPatchVersion();
  const latestPatch = getLatestPatch();
  const recommendations: string[] = [];

  if (currentPatch !== latestPatch.version) {
    recommendations.push(`Update to latest patch: ${latestPatch.version}`);
    const patchesSince = getPatchesSince(currentPatch);
    recommendations.push(`${patchesSince.length} patches available`);
  }

  return {
    timestamp: new Date(),
    currentPatch,
    latestPatch,
    totalPatches: PATCH_HISTORY.length,
    recommendations,
  };
};

/**
 * Adds a new patch to the history
 * Should be called when a new patch is released
 */
export const addNewPatch = (patchInfo: PatchInfo): void => {
  PATCH_HISTORY.unshift(patchInfo);
  updateCurrentPatchVersion(patchInfo.version);
  console.log(`New patch added: ${patchInfo.version}`);
};
