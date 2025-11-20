/**
 * Mock Guide Service
 * Provides mock data when API is unavailable
 * Used for testing and development
 */

import type { WowClass, Specialization } from '../types.ts';

export const getMockOverview = (wowClass: WowClass, expansion?: string): string => {
  const exp = expansion && expansion !== 'All' ? ` in ${expansion}` : '';
  return `# ${wowClass.name} Class Overview${exp}

## Core Identity
The ${wowClass.name} is a versatile class in World of Warcraft with unique strengths and playstyle mechanics.

## Playstyle
- **Strengths**: Excellent survivability and crowd control
- **Weaknesses**: Lower burst damage compared to other classes
- **Role**: Versatile in both PvE and PvP content

## Specializations
This class offers multiple specialization options:
${wowClass.specs.map(s => `- **${s.name}** (${s.role})`).join('\n')}

## Recent Changes
The most recent patch brought several balance adjustments to improve class viability in current content.

## Recommendations
- Focus on mastering your chosen specialization
- Keep your gear updated with current raid tier
- Practice rotation in training scenarios

*Note: This is mock data for demonstration purposes.*`;
};

export const getMockSpecGuide = (wowClass: WowClass, spec: Specialization, expansion?: string): string => {
  const exp = expansion && expansion !== 'All' ? ` in ${expansion}` : '';
  return `# ${spec.name} ${wowClass.name} Build & Guide${exp}

## Stat Priority
1. **Primary Stat**: Intellect/Strength/Agility (depending on class)
2. **Secondary Stats**: Haste > Mastery > Critical Strike > Versatility
3. **Tertiary Stats**: Speed > Leech

## Mythic+ Talent Build
**Ideal for:** Sustained damage and high utility in Mythic+ keys.

### Core Talents
- Talent 1: Provides strong AoE damage
- Talent 2: Increases survivability
- Talent 3: Enhances group utility

### Key Choice Nodes
- **Node A**: Choose for single-target focus
- **Node B**: Choose for multi-target focus

## Alternative Talent Builds
- **Single-Target Raid**: Optimized for boss encounters
- **PvP Build**: Focused on player-versus-player combat

## Advanced Tips
- **Nuanced Mechanics**: Understand ability interactions
- **Common Mistakes**: Avoid wasting cooldowns
- **Pro-Tips**: Maximize throughput with proper positioning

*Note: This is mock data for demonstration purposes.*`;
};

export const getMockRotationGuide = (wowClass: WowClass, spec: Specialization, expansion?: string): string => {
  const exp = expansion && expansion !== 'All' ? ` in ${expansion}` : '';
  return `# ${spec.name} ${wowClass.name} Rotation Guide${exp}

## Single-Target Rotation
1. \`[Ability 1]{Cooldown: 6 sec. ID: 12345. Description: Primary damage ability.}\`
2. \`[Ability 2]{Cooldown: 8 sec. ID: 12346. Description: Secondary damage ability.}\`
3. \`[Ability 3]{Cooldown: 10 sec. ID: 12347. Description: Filler ability.}\`

## Multi-Target (AoE) Rotation
- Use AoE abilities when fighting 3+ enemies
- Prioritize cleave damage on priority targets
- Maintain debuffs on all targets

## Offensive Cooldown Usage
\`[Major Cooldown]{Cooldown: 120 sec. ID: 12348. Description: Massive damage burst ability.}\`

Use during:
- Boss phases with high damage windows
- Mythic+ dungeon bosses
- PvP burst windows

## Defensive Cooldowns & Survival
\`[Defensive Cooldown]{Cooldown: 60 sec. ID: 12349. Description: Reduces incoming damage.}\`

**When to Use:**
- High incoming magic damage
- Boss mechanics requiring mitigation
- Emergency survival situations

*Note: This is mock data for demonstration purposes.*`;
};

export const getMockAddons = (wowClass: WowClass, expansion?: string): string => {
  const exp = expansion && expansion !== 'All' ? ` for ${expansion}` : '';
  return `# Essential Addons & WeakAuras${exp}

## General Must-Haves
- **DBM (Deadly Boss Mods)**: Essential for raid mechanics
- **Details!**: Damage meter for performance tracking
- **WeakAuras 2**: Custom UI and ability tracking

## ${wowClass.name} Specific Addons
- **Class-Specific Addon 1**: Tracks class-specific mechanics
- **Class-Specific Addon 2**: Optimizes rotation display
- **Class-Specific Addon 3**: Enhances survivability tracking

## WeakAuras Recommendations
### Key Tracking Elements
- Major offensive cooldowns
- Defensive cooldown availability
- Proc tracking
- Resource levels (mana, energy, etc.)

### Popular WeakAura Packs
- Search "Afenar ${wowClass.name}" on wago.io
- Search "Luxthos ${wowClass.name}" on wago.io
- Search "Weakaura Hub ${wowClass.name}" on wago.io

*Note: This is mock data for demonstration purposes.*`;
};

export const getMockDungeonTips = (wowClass: WowClass, spec: Specialization, dungeonName?: string, expansion?: string): string => {
  const dungeon = dungeonName || 'Mythic+ Dungeon';
  const exp = expansion && expansion !== 'All' ? ` from ${expansion}` : '';
  return `# ${spec.name} ${wowClass.name} Tips for ${dungeon}${exp}

## General Dungeon Strategy
### Key Utility
- Use crowd control on dangerous trash packs
- Coordinate with group for optimal positioning
- Manage resources efficiently throughout dungeon

## Boss Breakdown

### Boss 1: First Boss
**Spec-Specific Tips:**
- Use defensive cooldown during Phase 2
- Save burst for add spawn at 50% health
- Position yourself away from group for mechanics

### Boss 2: Second Boss
**Spec-Specific Tips:**
- Maintain distance from boss during mechanic
- Use mobility to avoid ground effects
- Coordinate with healer for survival

## Trash Pack Strategy
- Pull efficiently to maintain momentum
- Use AoE abilities on large packs
- Manage cooldowns between pulls

*Note: This is mock data for demonstration purposes.*`;
};
