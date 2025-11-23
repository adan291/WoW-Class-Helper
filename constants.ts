import type { WowClass, Dungeon } from './types.ts';

export const EXPANSIONS = [
  'All',
  'The War Within',
  'Dragonflight',
  'Shadowlands',
  'Battle for Azeroth',
  'Cataclysm',
];

export const DUNGEONS: Dungeon[] = [
  // The War Within
  { name: 'Ara-Kara, City of Echoes', expansion: 'The War Within' },
  { name: 'City of Threads', expansion: 'The War Within' },
  { name: 'The Stonevault', expansion: 'The War Within' },
  { name: 'The Dawnbreaker', expansion: 'The War Within' },
  { name: 'Priory of the Sacred Flame', expansion: 'The War Within' },
  { name: 'Darkflame Cleft', expansion: 'The War Within' },
  { name: 'Cinderbrew Meadery', expansion: 'The War Within' },
  { name: 'Rookery', expansion: 'The War Within' },

  // Dragonflight
  { name: "Algeth'ar Academy", expansion: 'Dragonflight' },
  { name: 'Ruby Life Pools', expansion: 'Dragonflight' },
  { name: 'The Azure Vault', expansion: 'Dragonflight' },
  { name: 'The Nokhud Offensive', expansion: 'Dragonflight' },
  { name: 'Brackenhide Hollow', expansion: 'Dragonflight' },
  { name: 'Halls of Infusion', expansion: 'Dragonflight' },
  { name: 'Neltharus', expansion: 'Dragonflight' },
  { name: 'Uldaman: Legacy of Tyr', expansion: 'Dragonflight' },

  // Shadowlands
  { name: 'Mists of Tirna Scithe', expansion: 'Shadowlands' },
  { name: 'The Necrotic Wake', expansion: 'Shadowlands' },
  { name: 'De Other Side', expansion: 'Shadowlands' },
  { name: 'Halls of Atonement', expansion: 'Shadowlands' },
  { name: 'Plaguefall', expansion: 'Shadowlands' },
  { name: 'Sanguine Depths', expansion: 'Shadowlands' },
  { name: 'Spires of Ascension', expansion: 'Shadowlands' },
  { name: 'Theater of Pain', expansion: 'Shadowlands' },

  // Legacy
  { name: 'Siege of Boralus', expansion: 'Battle for Azeroth' },
  { name: 'Grim Batol', expansion: 'Cataclysm' },
];

export const WOW_CLASSES: WowClass[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    color: '#C79C6E',
    specs: [
      { id: 'arms', name: 'Arms', role: 'Damage' },
      { id: 'fury', name: 'Fury', role: 'Damage' },
      { id: 'protection_warrior', name: 'Protection', role: 'Tank' },
    ],
  },
  {
    id: 'paladin',
    name: 'Paladin',
    color: '#F58CBA',
    specs: [
      { id: 'holy_paladin', name: 'Holy', role: 'Healer' },
      { id: 'protection_paladin', name: 'Protection', role: 'Tank' },
      { id: 'retribution', name: 'Retribution', role: 'Damage' },
    ],
  },
  {
    id: 'hunter',
    name: 'Hunter',
    color: '#ABD473',
    specs: [
      { id: 'beast_mastery', name: 'Beast Mastery', role: 'Damage' },
      { id: 'marksmanship', name: 'Marksmanship', role: 'Damage' },
      { id: 'survival', name: 'Survival', role: 'Damage' },
    ],
  },
  {
    id: 'rogue',
    name: 'Rogue',
    color: '#FFF569',
    specs: [
      { id: 'assassination', name: 'Assassination', role: 'Damage' },
      { id: 'outlaw', name: 'Outlaw', role: 'Damage' },
      { id: 'subtlety', name: 'Subtlety', role: 'Damage' },
    ],
  },
  {
    id: 'priest',
    name: 'Priest',
    color: '#FFFFFF',
    specs: [
      { id: 'discipline', name: 'Discipline', role: 'Healer' },
      { id: 'holy_priest', name: 'Holy', role: 'Healer' },
      { id: 'shadow', name: 'Shadow', role: 'Damage' },
    ],
  },
  {
    id: 'shaman',
    name: 'Shaman',
    color: '#0070DE',
    specs: [
      { id: 'elemental', name: 'Elemental', role: 'Damage' },
      { id: 'enhancement', name: 'Enhancement', role: 'Damage' },
      { id: 'restoration_shaman', name: 'Restoration', role: 'Healer' },
    ],
  },
  {
    id: 'mage',
    name: 'Mage',
    color: '#3FC7EB',
    specs: [
      { id: 'arcane', name: 'Arcane', role: 'Damage' },
      { id: 'fire', name: 'Fire', role: 'Damage' },
      { id: 'frost_mage', name: 'Frost', role: 'Damage' },
    ],
  },
  {
    id: 'warlock',
    name: 'Warlock',
    color: '#8787ED',
    specs: [
      { id: 'affliction', name: 'Affliction', role: 'Damage' },
      { id: 'demonology', name: 'Demonology', role: 'Damage' },
      { id: 'destruction', name: 'Destruction', role: 'Damage' },
    ],
  },
  {
    id: 'monk',
    name: 'Monk',
    color: '#00FF96',
    specs: [
      { id: 'brewmaster', name: 'Brewmaster', role: 'Tank' },
      { id: 'mistweaver', name: 'Mistweaver', role: 'Healer' },
      { id: 'windwalker', name: 'Windwalker', role: 'Damage' },
    ],
  },
  {
    id: 'druid',
    name: 'Druid',
    color: '#FF7D0A',
    specs: [
      { id: 'balance', name: 'Balance', role: 'Damage' },
      { id: 'feral', name: 'Feral', role: 'Damage' },
      { id: 'guardian', name: 'Guardian', role: 'Tank' },
      { id: 'restoration_druid', name: 'Restoration', role: 'Healer' },
    ],
  },
  {
    id: 'demon_hunter',
    name: 'Demon Hunter',
    color: '#A330C9',
    specs: [
      { id: 'havoc', name: 'Havoc', role: 'Damage' },
      { id: 'vengeance', name: 'Vengeance', role: 'Tank' },
    ],
  },
  {
    id: 'death_knight',
    name: 'Death Knight',
    color: '#C41F3B',
    specs: [
      { id: 'blood', name: 'Blood', role: 'Tank' },
      { id: 'frost_dk', name: 'Frost', role: 'Damage' },
      { id: 'unholy', name: 'Unholy', role: 'Damage' },
    ],
  },
  {
    id: 'evoker',
    name: 'Evoker',
    color: '#33937F',
    specs: [
      { id: 'devastation', name: 'Devastation', role: 'Damage' },
      { id: 'preservation', name: 'Preservation', role: 'Healer' },
      { id: 'augmentation', name: 'Augmentation', role: 'Damage' },
    ],
  },
];
