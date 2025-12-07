export interface Specialization {
  id: string;
  name: string;
  role: 'Tank' | 'Healer' | 'Damage';
}

export interface WowClass {
  id: string;
  name: string;
  color: string;
  specs: Specialization[];
  role?: 'tank' | 'healer' | 'dps';
  armorType: 'Cloth' | 'Leather' | 'Mail' | 'Plate';
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  icon?: string;
  description?: string;
  videoTutorials?: { title: string; url: string; thumbnail?: string }[];
}

export interface Dungeon {
  name: string;
  expansion: string;
}

export type UserRole = 'user' | 'master' | 'admin';
