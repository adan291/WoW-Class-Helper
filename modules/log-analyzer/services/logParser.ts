import { LogSummary, Role, SpellStats, Combatant } from '../types';

export const generateMockLog = (): LogSummary => {
  const spells: SpellStats[] = [
    {
      id: '1',
      name: 'Inferno Blast',
      count: 15,
      totalDamage: 1500000,
      avgDamage: 100000,
      targets: new Set(['MainTank', 'OffTank']),
      source: 'Ragnaros',
      timestamp: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 145],
      category: 'hostile',
    },
    {
      id: '2',
      name: 'Magma Splash',
      count: 40,
      totalDamage: 800000,
      avgDamage: 20000,
      targets: new Set(['Healer1', 'Mage1', 'Hunter1']),
      source: 'Ragnaros',
      timestamp: [10, 12, 14, 20, 22, 24, 60, 62, 64],
      category: 'hostile',
    },
    {
      id: '3',
      name: 'Hand of Ragnaros',
      count: 3,
      totalDamage: 3000000,
      avgDamage: 1000000,
      targets: new Set(['Rogue1', 'Warrior1']),
      source: 'Ragnaros',
      timestamp: [30, 90, 150],
      category: 'hostile',
    },
    {
      id: '4',
      name: 'Living Bomb',
      count: 5,
      totalDamage: 500000,
      avgDamage: 100000,
      targets: new Set(['Mage1', 'Warlock1']),
      source: 'Ragnaros',
      timestamp: [20, 50, 80, 110, 140],
      category: 'hostile',
    },
    {
      id: '101',
      name: 'Mortal Strike',
      count: 25,
      totalDamage: 1250000,
      avgDamage: 50000,
      targets: new Set(['Ragnaros']),
      source: 'Warrior1',
      timestamp: [5, 10, 15, 20, 25],
      category: 'friendly',
    },
    {
      id: '102',
      name: 'Fireball',
      count: 50,
      totalDamage: 2000000,
      avgDamage: 40000,
      targets: new Set(['Ragnaros']),
      source: 'Mage1',
      timestamp: [2, 4, 6, 8, 10],
      category: 'friendly',
    },
  ];

  const combatants: Combatant[] = [
    { name: 'MainTank', role: Role.TANK, class: 'Warrior' },
    { name: 'OffTank', role: Role.TANK, class: 'Paladin' },
    { name: 'Healer1', role: Role.HEALER, class: 'Priest' },
    { name: 'Mage1', role: Role.RANGED, class: 'Mage' },
    { name: 'Rogue1', role: Role.MELEE, class: 'Rogue' },
    { name: 'Warrior1', role: Role.MELEE, class: 'Warrior' },
  ];

  return {
    encounterName: 'Ragnaros (Mock)',
    duration: 180,
    spells: spells,
    combatants: combatants,
    startTime: Date.now() - 180000,
    endTime: Date.now(),
    rawLineCount: 500,
  };
};

export const parseLogFile = async (file: File): Promise<LogSummary> => {
  if (file.size === 0) {
    return Promise.reject(new Error('The uploaded file is empty (0 bytes).'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;

      if (typeof text !== 'string') {
        reject(new Error('Failed to read file as text.'));
        return;
      }

      try {
        const summary = processLogText(text);
        if (summary.rawLineCount === 0) {
          reject(
            new Error(
              'No valid WoW combat log events found in the file. Please ensure it is a valid text log.'
            )
          );
          return;
        }
        resolve(summary);
      } catch (e) {
        console.error('Parsing Error:', e);
        reject(new Error('An error occurred while parsing the log file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsText(file);
  });
};

const processLogText = (text: string): LogSummary => {
  const lines = text.split('\n');
  const spellsMap = new Map<string, SpellStats>();
  const combatantsMap = new Map<string, Combatant>();

  let startTime = 0;
  let endTime = 0;
  let encounterName = 'Unknown Encounter';
  let validLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.length < 20) continue;

    const firstSpace = line.indexOf('  ');
    if (firstSpace === -1) continue;

    const timestampStr = line.substring(0, firstSpace);
    const rest = line.substring(firstSpace + 2);
    const params = rest.split(',');

    const eventType = params[0];
    const sourceGUID = params[1];
    const sourceName = params[2]?.replace(/"/g, '');
    const destName = params[6]?.replace(/"/g, '');
    const spellId = params[9];
    const spellName = params[10]?.replace(/"/g, '');

    const timeParts = timestampStr.split(' ');
    if (timeParts.length < 2) continue;
    const timeSubParts = timeParts[1].split(':');
    const seconds =
      parseFloat(timeSubParts[2]) +
      parseInt(timeSubParts[1]) * 60 +
      parseInt(timeSubParts[0]) * 3600;

    validLines++;

    if (startTime === 0) startTime = seconds;
    endTime = seconds;

    if (eventType === 'ENCOUNTER_START') {
      encounterName = params[2]?.replace(/"/g, '') || 'Unknown';
      startTime = seconds;
    }

    if (eventType === 'SPELL_DAMAGE' || eventType === 'SPELL_CAST_SUCCESS') {
      const isEnemy =
        sourceGUID.startsWith('Creature') ||
        sourceGUID.startsWith('Vehicle') ||
        sourceGUID.startsWith('Boss');
      const isPlayer = sourceGUID.startsWith('Player');

      if ((isEnemy || isPlayer) && spellName) {
        const uniqueKey = spellName + (isEnemy ? '_HOSTILE' : '_FRIENDLY');

        if (!spellsMap.has(uniqueKey)) {
          spellsMap.set(uniqueKey, {
            id: spellId,
            name: spellName,
            count: 0,
            totalDamage: 0,
            avgDamage: 0,
            targets: new Set(),
            source: sourceName,
            timestamp: [],
            category: isEnemy ? 'hostile' : 'friendly',
          });
        }

        const spell = spellsMap.get(uniqueKey)!;
        spell.count++;
        spell.timestamp.push(seconds - startTime);

        if (destName) {
          spell.targets.add(destName);
          if (isEnemy && !combatantsMap.has(destName)) {
            combatantsMap.set(destName, { name: destName, role: Role.UNKNOWN });
          }
        }

        if (eventType === 'SPELL_DAMAGE') {
          const amount = parseInt(params[29]);
          if (!isNaN(amount)) {
            spell.totalDamage += amount;
            spell.avgDamage = Math.round(spell.totalDamage / spell.count);
          }
        }
      }
    }
  }

  return {
    encounterName,
    duration: endTime - startTime,
    spells: Array.from(spellsMap.values()),
    combatants: Array.from(combatantsMap.values()),
    startTime,
    endTime,
    rawLineCount: validLines,
  };
};
