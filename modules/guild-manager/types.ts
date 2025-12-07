export enum Role {
  TANK = 'Tank',
  HEALER = 'Healer',
  DPS = 'DPS',
}

export enum ApplicationStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export enum UserRole {
  ADMIN = 'Administrator',
  OFFICER = 'Officer',
  MEMBER = 'Member',
  USER = 'User',
}

export interface WoWSpec {
  name: string;
  role: Role;
}

export interface WoWClass {
  name: string;
  color: string;
  icon: string;
  specs: WoWSpec[];
}

export interface CustomQuestion {
  id: string;
  label: string;
}

export interface GuildPerk {
  title: string;
  text: string;
}

export interface GuildEvent {
  id: string;
  title: string;
  date: Date;
  type: 'Raid' | 'Mythic+' | 'PvP' | 'Social';
  description?: string;
  guildId: string;
}

export interface GuildAnnouncement {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface Guild {
  id: string;
  name: string;
  description?: string;
  officerEmail?: string;
  customQuestions?: CustomQuestion[];
  raidExperiences?: string[];
  availabilitySlots?: string[];
  perks?: GuildPerk[];
  warcraftLogsUrl?: string;
  wowProgressUrl?: string;
  announcements?: GuildAnnouncement[];
}

export interface AuthUser {
  name: string;
  email: string;
  picture: string;
  role: UserRole;
  guildId?: string | null;
  guildName?: string;
  discordId?: string;
}

export interface Application {
  id: string;
  playerName: string;
  wowClass: string;
  wowSpec: string;
  itemLevel: number;
  raidExperience: string[];
  logsUrl: string;
  availability: string[];
  role: Role;
  reason: string;
  status: ApplicationStatus;
  submissionDate: Date;
  isNew: boolean;
  guildId: string;
  guildName: string;
  customAnswers?: Record<string, string>;
}

export interface AnalysisResult {
  summary: {
    averageDps: number;
    peakDps: number;
    primaryAbilityUptimePercent: number;
    primaryAbilityName: string;
  };
  commonErrors: string[];
  comparison: {
    percentile: number;
    comment: string;
  };
  chartsData: {
    abilityUsage: { abilityName: string; casts: number }[];
    downtimePercent: number;
  };
  recommendations: {
    spellIconUrl: string;
    suggestion: string;
  }[];
}

export interface GuildMember {
  id: string;
  name: string;
  wowClass: string;
  role: Role;
  rank: 'Guild Master' | 'Officer' | 'Raider' | 'Member';
  notes?: string;
}
