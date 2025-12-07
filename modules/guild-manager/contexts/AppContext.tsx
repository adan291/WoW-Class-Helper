import React, { createContext, useState, ReactNode, useMemo } from 'react';
import {
  Application,
  ApplicationStatus,
  Role,
  Guild,
  AuthUser,
  UserRole,
  GuildMember,
  GuildEvent,
  GuildAnnouncement,
} from '../types';
import { RAID_EXPERIENCES, AVAILABILITY_SLOTS } from '../constants';

interface AppContextType {
  applications: Application[];
  guilds: Guild[];
  authenticatedUser: AuthUser | null;
  notifications: Application[];
  roster: GuildMember[];
  events: GuildEvent[];
  addApplication: (app: Omit<Application, 'id' | 'status' | 'submissionDate' | 'isNew'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateApplication: (id: string, updatedApp: Application) => void;
  login: (roleType?: UserRole) => Promise<void>;
  logout: () => void;
  markNotificationsAsRead: () => void;
  updateGuildDetails: (guildId: string, updates: Partial<Guild>) => void;
  updateMemberNotes: (memberId: string, notes: string) => void;
  addEvent: (event: Omit<GuildEvent, 'id'>) => void;
  deleteEvent: (eventId: string) => void;
  linkDiscord: () => void;
  setAuthenticatedUserFromHub: (user: AuthUser | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// --- MOCK DATA ---
const MOCK_ANNOUNCEMENTS: GuildAnnouncement[] = [
  {
    id: 'a1',
    author: 'Sylvanas',
    content: 'Raid times for next week are shifted to 8 PM Server Time due to holidays.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'a2',
    author: 'Grommash',
    content: 'Mythic+ keys push tonight! Check Discord for groups.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

const MOCK_GUILDS: Guild[] = [
  {
    id: 'g1',
    name: 'Eternal Oath',
    description: 'A semi-hardcore guild focusing on CE every tier.',
    officerEmail: 'officer@eternaloath.com',
    customQuestions: [
      { id: 'q1', label: 'What is your past raiding history?' },
      { id: 'q2', label: 'Do you have a stable internet connection and microphone?' },
    ],
    raidExperiences: RAID_EXPERIENCES,
    availabilitySlots: AVAILABILITY_SLOTS,
    warcraftLogsUrl: 'https://www.warcraftlogs.com/guild/us/area-52/eternal%20oath',
    wowProgressUrl: 'https://www.wowprogress.com/guild/us/area-52/Eternal+Oath',
    perks: [
      { title: 'Progression Raiding', text: 'Cutting Edge focused environment.' },
      { title: 'Flasks & Feasts', text: 'All consumables provided during raid hours.' },
    ],
    announcements: MOCK_ANNOUNCEMENTS,
  },
  { id: 'g2', name: 'Crimson Vanguard', description: 'PvP focused guild.', customQuestions: [] },
  {
    id: 'g3',
    name: 'Azure Concord',
    officerEmail: 'contact@azureconcord.org',
    customQuestions: [],
  },
];

const MOCK_EVENTS: GuildEvent[] = [
  {
    id: 'e1',
    title: 'Main Raid - Farm',
    date: new Date(),
    type: 'Raid',
    description: 'Clearing heroic for alts/vault.',
    guildId: 'g1',
  },
  {
    id: 'e2',
    title: 'Mythic Progression',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    type: 'Raid',
    description: 'Working on Tindral.',
    guildId: 'g1',
  },
  {
    id: 'e3',
    title: 'RBGs Night',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    type: 'PvP',
    description: 'Rating push.',
    guildId: 'g1',
  },
];

const MOCK_USERS_DB: AuthUser[] = [
  {
    name: 'Sylvanas',
    email: 'sylvanas.w@horde.com',
    picture: 'https://i.pravatar.cc/150?u=sylvanas',
    role: UserRole.ADMIN,
    guildId: 'g1',
    guildName: 'Eternal Oath',
    discordId: 'Sylvanas#1234',
  },
  {
    name: 'Grommash',
    email: 'grommash@horde.com',
    picture: 'https://i.pravatar.cc/150?u=grommash',
    role: UserRole.OFFICER,
    guildId: 'g1',
    guildName: 'Eternal Oath',
  },
  {
    name: 'Anduin',
    email: 'anduin@alliance.com',
    picture: 'https://i.pravatar.cc/150?u=anduin',
    role: UserRole.MEMBER,
    guildId: 'g1',
    guildName: 'Eternal Oath',
  },
  {
    name: 'New Player',
    email: 'newplayer@wow.com',
    picture: 'https://i.pravatar.cc/150?u=newplayer',
    role: UserRole.USER,
    guildId: null,
    guildName: '',
  },
];

const MOCK_ROSTER: GuildMember[] = [
  {
    id: 'r1',
    name: 'Sylvanas',
    wowClass: 'Hunter',
    role: Role.DPS,
    rank: 'Guild Master',
    notes: 'Exceptional leadership and raid awareness.',
  },
  { id: 'r2', name: 'Grommash', wowClass: 'Warrior', role: Role.DPS, rank: 'Officer', notes: '' },
  {
    id: 'r3',
    name: 'Thrall',
    wowClass: 'Shaman',
    role: Role.DPS,
    rank: 'Officer',
    notes: 'Great at mechanics.',
  },
  {
    id: 'r4',
    name: 'Anduin',
    wowClass: 'Priest',
    role: Role.HEALER,
    rank: 'Raider',
    notes: 'Excellent healing output.',
  },
  { id: 'r5', name: 'Bolvar', wowClass: 'Paladin', role: Role.TANK, rank: 'Raider', notes: '' },
  { id: 'r6', name: 'Varian', wowClass: 'Warrior', role: Role.TANK, rank: 'Raider', notes: '' },
  {
    id: 'r7',
    name: 'Malfurion',
    wowClass: 'Druid',
    role: Role.HEALER,
    rank: 'Raider',
    notes: 'Always brings consumables.',
  },
  { id: 'r8', name: 'Tyrande', wowClass: 'Hunter', role: Role.DPS, rank: 'Raider', notes: '' },
  {
    id: 'r9',
    name: 'Illidan',
    wowClass: 'Demon Hunter',
    role: Role.DPS,
    rank: 'Member',
    notes: 'Attendance is spotty.',
  },
  {
    id: 'r10',
    name: 'Arthas',
    wowClass: 'Death Knight',
    role: Role.TANK,
    rank: 'Member',
    notes: '',
  },
  { id: 'r11', name: 'Jaina', wowClass: 'Mage', role: Role.DPS, rank: 'Member', notes: '' },
  {
    id: 'r12',
    name: 'Khadgar',
    wowClass: 'Mage',
    role: Role.DPS,
    rank: 'Member',
    notes: 'Loves dad jokes.',
  },
];

const initialApplications: Application[] = [
  {
    id: '1',
    playerName: 'Garrosh',
    wowClass: 'Warrior',
    wowSpec: 'Arms',
    itemLevel: 488,
    raidExperience: ["Amirdrassil, the Dream's Hope (Mythic)"],
    logsUrl: 'https://www.warcraftlogs.com/character/us/malganis/grommash',
    availability: ['Tuesday Evening', 'Thursday Evening'],
    role: Role.DPS,
    reason: 'Looking for a new home.',
    status: ApplicationStatus.PENDING,
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isNew: false,
    guildId: 'g1',
    guildName: 'Eternal Oath',
    customAnswers: {
      q1: 'Cleared all of Shadowlands on mythic difficulty.',
      q2: 'Yes, fiber optic and a Blue Yeti.',
    },
  },
  {
    id: '2',
    playerName: 'Jaina',
    wowClass: 'Mage',
    wowSpec: 'Frost',
    itemLevel: 490,
    raidExperience: [
      "Amirdrassil, the Dream's Hope (Mythic)",
      'Aberrus, the Shadowed Crucible (Mythic)',
    ],
    logsUrl: 'https://www.warcraftlogs.com/character/us/proudmoore/jaina',
    availability: ['Wednesday Evening', 'Sunday Evening'],
    role: Role.DPS,
    reason: 'To study the arcane arts and defeat our foes.',
    status: ApplicationStatus.ACCEPTED,
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isNew: false,
    guildId: 'g3',
    guildName: 'Azure Concord',
    customAnswers: {},
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [guilds, setGuilds] = useState<Guild[]>(MOCK_GUILDS);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);
  const [roster, setRoster] = useState<GuildMember[]>(MOCK_ROSTER);
  const [events, setEvents] = useState<GuildEvent[]>(MOCK_EVENTS);

  // Compute notifications from applications - no need for separate state
  const notifications = useMemo(() => {
    if (authenticatedUser && authenticatedUser.guildId) {
      return applications.filter((app) => app.isNew && app.guildId === authenticatedUser.guildId);
    }
    return [];
  }, [applications, authenticatedUser]);

  const addApplication = (app: Omit<Application, 'id' | 'status' | 'submissionDate' | 'isNew'>) => {
    const newApplication: Application = {
      ...app,
      id: new Date().toISOString(),
      status: ApplicationStatus.PENDING,
      submissionDate: new Date(),
      isNew: true,
    };
    setApplications((prev) => [newApplication, ...prev]);
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
  };

  const updateApplication = (id: string, updatedApp: Application) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? updatedApp : app)));
  };

  const login = async (roleType: UserRole = UserRole.ADMIN) => {
    return new Promise<void>((resolve, reject) => {
      const shouldFail = Math.random() < 0.1;
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('Battle.net API connection timeout. Please try again.'));
          return;
        }
        const user = MOCK_USERS_DB.find((u) => u.role === roleType) || MOCK_USERS_DB[0];
        if (user.guildId) {
          const guild = guilds.find((g) => g.id === user.guildId);
          setAuthenticatedUser({ ...user, guildName: guild?.name });
        } else {
          setAuthenticatedUser(user);
        }
        resolve();
      }, 1500);
    });
  };

  const logout = () => setAuthenticatedUser(null);

  const markNotificationsAsRead = () => {
    if (!authenticatedUser) return;
    setApplications((prev) =>
      prev.map((app) =>
        app.isNew && app.guildId === authenticatedUser.guildId ? { ...app, isNew: false } : app
      )
    );
  };

  const updateGuildDetails = (guildId: string, updates: Partial<Guild>) => {
    setGuilds((prev) => prev.map((g) => (g.id === guildId ? { ...g, ...updates } : g)));
  };

  const updateMemberNotes = (memberId: string, notes: string) => {
    setRoster((prev) =>
      prev.map((member) => (member.id === memberId ? { ...member, notes } : member))
    );
  };

  const addEvent = (event: Omit<GuildEvent, 'id'>) => {
    const newEvent: GuildEvent = { ...event, id: Date.now().toString() };
    setEvents((prev) => [...prev, newEvent]);
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const linkDiscord = () => {
    if (!authenticatedUser) return;
    setTimeout(() => {
      setAuthenticatedUser((prev) =>
        prev
          ? { ...prev, discordId: `${prev.name}#${Math.floor(1000 + Math.random() * 9000)}` }
          : null
      );
    }, 1000);
  };

  const setAuthenticatedUserFromHub = (user: AuthUser | null) => setAuthenticatedUser(user);

  return (
    <AppContext.Provider
      value={{
        applications,
        guilds,
        authenticatedUser,
        notifications,
        roster,
        events,
        addApplication,
        updateApplicationStatus,
        updateApplication,
        login,
        logout,
        markNotificationsAsRead,
        updateGuildDetails,
        updateMemberNotes,
        addEvent,
        deleteEvent,
        linkDiscord,
        setAuthenticatedUserFromHub,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
