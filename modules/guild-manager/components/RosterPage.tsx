import React, { useContext, useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppContext } from '../contexts/AppContext';
import { WOW_CLASSES } from '../constants';
import { GuildMember, Role, UserRole } from '../types';

const TankIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    className="text-blue-400"
  >
    <path d="M466.5 83.7l-192-80a48.15 48.15 0 00-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C381.5 463.7 496 326.5 496 128c0-19.4-11.7-36.9-29.5-44.3z"></path>
  </svg>
);
const HealerIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    className="text-green-400"
  >
    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z"></path>
  </svg>
);
const DpsIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    className="text-red-400"
  >
    <path d="M496 384H320v-64h176c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H32C14.3 32 0 46.3 0 64v224c0 17.7 14.3 32 32 32h176v64H16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-96c0-8.8-7.2-16-16-16z"></path>
  </svg>
);
const SortIcon = ({ direction }: { direction?: 'asc' | 'desc' }) => {
  if (!direction) return <span className="w-4 h-4 opacity-30">↕</span>;
  return direction === 'asc' ? (
    <span className="w-4 h-4">↑</span>
  ) : (
    <span className="w-4 h-4">↓</span>
  );
};

const NotesModal: React.FC<{ member: GuildMember; onClose: () => void }> = ({
  member,
  onClose,
}) => {
  const { t } = useLanguage();
  const context = useContext(AppContext);
  const [notes, setNotes] = useState(member.notes || '');

  const handleSave = () => {
    context?.updateMemberNotes(member.id, notes);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="wow-panel w-full max-w-lg font-cinzel" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-wow-brown-dark dark:text-wow-gold">
            {t('roster_notes_modal_header')} {member.name}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="wow-input w-full"
            rows={8}
            placeholder={`Add notes for ${member.name}...`}
          />
          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="wow-button bg-gray-500/20">
              {t('roster_notes_modal_close')}
            </button>
            <button onClick={handleSave} className="wow-button">
              {t('roster_notes_modal_save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RosterPage() {
  const { t } = useLanguage();
  const context = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof GuildMember;
    direction: 'asc' | 'desc';
  }>({ key: 'rank', direction: 'asc' });
  const [notesModalMember, setNotesModalMember] = useState<GuildMember | null>(null);

  const rankOrder: { [key in GuildMember['rank']]: number } = {
    'Guild Master': 0,
    Officer: 1,
    Raider: 2,
    Member: 3,
  };

  const filteredAndSortedRoster = useMemo(() => {
    let members = [...(context?.roster || [])];
    if (searchTerm) {
      members = members.filter((member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    members.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      if (sortConfig.key === 'rank') {
        aValue = rankOrder[a.rank];
        bValue = rankOrder[b.rank];
      } else {
        aValue = a[sortConfig.key] as string;
        bValue = b[sortConfig.key] as string;
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    return members;
  }, [context?.roster, searchTerm, sortConfig]);

  const handleSort = (key: keyof GuildMember) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.TANK:
        return <TankIcon />;
      case Role.HEALER:
        return <HealerIcon />;
      case Role.DPS:
        return <DpsIcon />;
      default:
        return null;
    }
  };

  const canViewNotes =
    context?.authenticatedUser?.role === UserRole.ADMIN ||
    context?.authenticatedUser?.role === UserRole.OFFICER;

  return (
    <div className="font-cinzel">
      {notesModalMember && (
        <NotesModal member={notesModalMember} onClose={() => setNotesModalMember(null)} />
      )}
      <div className="wow-panel">
        <h1 className="text-3xl md:text-4xl font-bold text-wow-brown-dark dark:text-wow-gold text-center tracking-wider">
          {t('roster_header')}
        </h1>
        <p className="text-center text-wow-brown dark:text-gray-300 mt-2 mb-8 max-w-3xl mx-auto">
          {t('roster_subheader')}
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder={t('roster_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="wow-input w-full max-w-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-wow-parchment-dark dark:bg-wow-gray-900 text-wow-brown-dark dark:text-wow-gold uppercase tracking-wider text-sm">
              <tr>
                <th className="p-4">
                  <button className="flex items-center gap-2" onClick={() => handleSort('name')}>
                    {t('roster_table_name')}{' '}
                    <SortIcon
                      direction={sortConfig.key === 'name' ? sortConfig.direction : undefined}
                    />
                  </button>
                </th>
                <th className="p-4">
                  <button
                    className="flex items-center gap-2"
                    onClick={() => handleSort('wowClass')}
                  >
                    {t('roster_table_class')}{' '}
                    <SortIcon
                      direction={sortConfig.key === 'wowClass' ? sortConfig.direction : undefined}
                    />
                  </button>
                </th>
                <th className="p-4">
                  <button className="flex items-center gap-2" onClick={() => handleSort('role')}>
                    {t('roster_table_role')}{' '}
                    <SortIcon
                      direction={sortConfig.key === 'role' ? sortConfig.direction : undefined}
                    />
                  </button>
                </th>
                <th className="p-4">
                  <button className="flex items-center gap-2" onClick={() => handleSort('rank')}>
                    {t('roster_table_rank')}{' '}
                    <SortIcon
                      direction={sortConfig.key === 'rank' ? sortConfig.direction : undefined}
                    />
                  </button>
                </th>
                {canViewNotes && <th className="p-4">{t('roster_table_actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRoster.map((member) => {
                const classData = WOW_CLASSES.find((c) => c.name === member.wowClass);
                const rankStyle =
                  member.rank === 'Guild Master'
                    ? 'text-red-500 font-bold'
                    : member.rank === 'Officer'
                      ? 'text-orange-400'
                      : member.rank === 'Raider'
                        ? 'text-green-400'
                        : 'text-gray-300';
                return (
                  <tr
                    key={member.id}
                    className={`border-b border-wow-brown-dark/20 dark:border-wow-gray-700 hover:bg-wow-parchment-dark dark:hover:bg-wow-gray-700/50 transition-colors duration-200 ${member.rank === 'Guild Master' ? 'gm-highlight' : ''}`}
                  >
                    <td className="p-4 font-bold" style={{ color: classData?.color || '#FFFFFF' }}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {classData && (
                          <img
                            src={classData.icon}
                            alt={classData.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span style={{ color: classData?.color || '#FFFFFF' }}>
                          {member.wowClass}
                        </span>
                      </div>
                    </td>
                    <td className="text-wow-brown-dark/80 dark:text-gray-300 p-4">{member.role}</td>
                    <td className={`p-4 ${rankStyle}`}>{member.rank}</td>
                    {canViewNotes && (
                      <td className="p-4">
                        <button
                          onClick={() => setNotesModalMember(member)}
                          className="wow-button !text-xs !py-1 !px-3"
                        >
                          {t('roster_notes_button')}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
