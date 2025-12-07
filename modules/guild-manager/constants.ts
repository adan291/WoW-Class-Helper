import { Role, WoWClass } from './types';

export const WOW_CLASSES: WoWClass[] = [
  {
    name: 'Warrior',
    color: '#C79C6E',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_warrior.jpg',
    specs: [
      { name: 'Arms', role: Role.DPS },
      { name: 'Fury', role: Role.DPS },
      { name: 'Protection', role: Role.TANK },
    ],
  },
  {
    name: 'Paladin',
    color: '#F58CBA',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_paladin.jpg',
    specs: [
      { name: 'Holy', role: Role.HEALER },
      { name: 'Protection', role: Role.TANK },
      { name: 'Retribution', role: Role.DPS },
    ],
  },
  {
    name: 'Hunter',
    color: '#ABD473',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_hunter.jpg',
    specs: [
      { name: 'Beast Mastery', role: Role.DPS },
      { name: 'Marksmanship', role: Role.DPS },
      { name: 'Survival', role: Role.DPS },
    ],
  },
  {
    name: 'Rogue',
    color: '#FFF569',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_rogue.jpg',
    specs: [
      { name: 'Assassination', role: Role.DPS },
      { name: 'Outlaw', role: Role.DPS },
      { name: 'Subtlety', role: Role.DPS },
    ],
  },
  {
    name: 'Priest',
    color: '#FFFFFF',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_priest.jpg',
    specs: [
      { name: 'Discipline', role: Role.HEALER },
      { name: 'Holy', role: Role.HEALER },
      { name: 'Shadow', role: Role.DPS },
    ],
  },
  {
    name: 'Death Knight',
    color: '#C41F3B',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_deathknight.jpg',
    specs: [
      { name: 'Blood', role: Role.TANK },
      { name: 'Frost', role: Role.DPS },
      { name: 'Unholy', role: Role.DPS },
    ],
  },
  {
    name: 'Shaman',
    color: '#0070DE',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_shaman.jpg',
    specs: [
      { name: 'Elemental', role: Role.DPS },
      { name: 'Enhancement', role: Role.DPS },
      { name: 'Restoration', role: Role.HEALER },
    ],
  },
  {
    name: 'Mage',
    color: '#40C7EB',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_mage.jpg',
    specs: [
      { name: 'Arcane', role: Role.DPS },
      { name: 'Fire', role: Role.DPS },
      { name: 'Frost', role: Role.DPS },
    ],
  },
  {
    name: 'Warlock',
    color: '#8787ED',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_warlock.jpg',
    specs: [
      { name: 'Affliction', role: Role.DPS },
      { name: 'Demonology', role: Role.DPS },
      { name: 'Destruction', role: Role.DPS },
    ],
  },
  {
    name: 'Monk',
    color: '#00FF96',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_monk.jpg',
    specs: [
      { name: 'Brewmaster', role: Role.TANK },
      { name: 'Mistweaver', role: Role.HEALER },
      { name: 'Windwalker', role: Role.DPS },
    ],
  },
  {
    name: 'Druid',
    color: '#FF7D0A',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_druid.jpg',
    specs: [
      { name: 'Balance', role: Role.DPS },
      { name: 'Feral', role: Role.DPS },
      { name: 'Guardian', role: Role.TANK },
      { name: 'Restoration', role: Role.HEALER },
    ],
  },
  {
    name: 'Demon Hunter',
    color: '#A330C9',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_demonhunter.jpg',
    specs: [
      { name: 'Havoc', role: Role.DPS },
      { name: 'Vengeance', role: Role.TANK },
    ],
  },
  {
    name: 'Evoker',
    color: '#33937F',
    icon: 'https://wow.zamimg.com/images/wow/icons/large/classicon_evoker.jpg',
    specs: [
      { name: 'Devastation', role: Role.DPS },
      { name: 'Preservation', role: Role.HEALER },
      { name: 'Augmentation', role: Role.DPS },
    ],
  },
];

export const RAID_EXPERIENCES = [
  "Amirdrassil, the Dream's Hope (Mythic)",
  "Amirdrassil, the Dream's Hope (Heroic)",
  'Aberrus, the Shadowed Crucible (Mythic)',
  'Vault of the Incarnates (Mythic)',
];

export const AVAILABILITY_SLOTS = [
  'Monday Evening',
  'Tuesday Evening',
  'Wednesday Evening',
  'Thursday Evening',
  'Friday Evening',
  'Saturday Afternoon',
  'Saturday Evening',
  'Sunday Afternoon',
  'Sunday Evening',
];
