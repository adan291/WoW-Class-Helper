export enum Role {
  TANK = 'Tank',
  HEALER = 'Healer',
  MELEE = 'Melee DPS',
  RANGED = 'Ranged DPS',
  UNKNOWN = 'Unknown',
}

export interface SpellStats {
  id: string;
  name: string;
  count: number;
  totalDamage: number;
  avgDamage: number;
  targets: Set<string>;
  source: string;
  timestamp: number[];
  category: 'hostile' | 'friendly';
}

export interface Combatant {
  name: string;
  role: Role;
  class?: string;
}

export interface LogSummary {
  encounterName: string;
  duration: number;
  spells: SpellStats[];
  combatants: Combatant[];
  startTime: number;
  endTime: number;
  rawLineCount: number;
}

export interface AIStrategyResult {
  markdown: string;
  phases: { name: string; timestamp: number }[];
}

export interface AIMiniGameConfig {
  bossName: string;
  mechanics: {
    name: string;
    type: 'dodge' | 'soak' | 'spread';
    color: string;
    description: string;
    damage: number;
    interval: number;
    radius: number;
  }[];
}

export interface SpellAIAnalysis {
  roles: Role[];
  description: string;
}
