
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
}

export interface Dungeon {
  name: string;
  expansion: string;
}

export type UserRole = 'user' | 'master' | 'admin';
