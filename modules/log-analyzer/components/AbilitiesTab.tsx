import React, { useEffect, useState } from 'react';
import { LogSummary, Role, SpellAIAnalysis } from '../types';
import { classifySpellsByRole } from '../services/geminiService';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

interface Props {
  data: LogSummary;
}

const AbilitiesTab: React.FC<Props> = ({ data }) => {
  const [classifications, setClassifications] = useState<Record<string, SpellAIAnalysis>>({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'incoming' | 'outgoing'>('incoming');
  const [roleFilter, setRoleFilter] = useState<Role | 'All'>('All');
  const [editingSpell, setEditingSpell] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClassification = async () => {
      setLoading(true);
      try {
        const hostileSpells = data.spells.filter((s) => s.category === 'hostile');
        const result = await classifySpellsByRole(hostileSpells);
        setClassifications(result);
      } catch (error) {
        console.error('Failed to classify', error);
      } finally {
        setLoading(false);
      }
    };

    if (import.meta.env.VITE_GEMINI_API_KEY) {
      fetchClassification();
    }
  }, [data]);

  const handleManualRoleChange = (spellName: string, newRole: Role) => {
    setClassifications((prev) => ({
      ...prev,
      [spellName]: {
        roles: [newRole],
        description: prev[spellName]?.description || 'Manually reclassified.',
      },
    }));
    setEditingSpell(null);
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.TANK:
        return <span className="text-blue-400">🛡️</span>;
      case Role.HEALER:
        return <span className="text-green-400">💚</span>;
      case Role.MELEE:
        return <span className="text-red-400">⚔️</span>;
      case Role.RANGED:
        return <span className="text-purple-400">🎯</span>;
      default:
        return <span className="text-gray-500">❓</span>;
    }
  };

  const hostileSpells = data.spells.filter((s) => s.category === 'hostile');
  const maxHostileDamage = Math.max(...hostileSpells.map((s) => s.totalDamage), 1);
  const maxHostileCount = Math.max(...hostileSpells.map((s) => s.count), 1);

  const getSpellsForRole = (role: Role) => {
    return data.spells.filter((spell) => {
      if (spell.category !== 'hostile') return false;
      if (searchTerm && !spell.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      const analysis = classifications[spell.name];
      if (analysis?.roles?.map((c) => c.toLowerCase()).includes(role.toLowerCase())) return true;

      if (!import.meta.env.VITE_GEMINI_API_KEY && !analysis) {
        if (role === Role.TANK && spell.avgDamage > 50000) return true;
        if (role === Role.HEALER && spell.targets.size > 2) return true;
        if (role === Role.MELEE && spell.name.includes('Strike')) return true;
      }
      return false;
    });
  };

  const RoleSection = ({
    role,
    title,
    colorClass,
    expanded = false,
  }: {
    role: Role;
    title: string;
    colorClass: string;
    expanded?: boolean;
  }) => {
    const spells = getSpellsForRole(role);

    return (
      <div
        className={`bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col h-full ${expanded ? 'col-span-full' : ''}`}
      >
        <div className={`flex items-center gap-2 mb-4 pb-2 border-b border-gray-700 ${colorClass}`}>
          {getRoleIcon(role)}
          <h3 className="font-bold text-lg">{title}</h3>
          <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
            {spells.length} Abilities
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {spells.length === 0 && (
            <p className="text-gray-500 text-sm italic py-4 text-center">
              {searchTerm
                ? 'No abilities match search.'
                : 'No specific abilities detected for this role.'}
            </p>
          )}
          {spells.map((spell) => {
            const damagePercent = (spell.totalDamage / maxHostileDamage) * 100;
            const countPercent = (spell.count / maxHostileCount) * 100;
            const analysis = classifications[spell.name];

            return (
              <div
                key={spell.id}
                className="relative bg-gray-800 rounded border border-transparent hover:border-yellow-500 group overflow-hidden transition-colors"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-red-900/10 pointer-events-none"
                  style={{ width: `${damagePercent}%` }}
                />

                <div className="relative p-3 z-10">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-medium text-gray-200 flex items-center gap-2">
                        {spell.name}
                        <span className="text-[10px] text-gray-600 font-mono bg-black/30 px-1 rounded">
                          #{spell.id}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setEditingSpell(editingSpell === spell.name ? null : spell.name)
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white"
                      title="Manually Correct Role"
                    >
                      ✏️
                    </button>
                  </div>

                  {analysis?.description && (
                    <p className="text-xs text-gray-500 italic mb-2">{analysis.description}</p>
                  )}

                  {editingSpell === spell.name && (
                    <div className="absolute right-2 top-8 z-20 bg-gray-800 border border-gray-500 rounded shadow-xl p-2 flex flex-col gap-1 w-40">
                      <p className="text-[10px] text-gray-400 uppercase font-bold px-2 mb-1">
                        Move to Role:
                      </p>
                      {Object.values(Role)
                        .filter((r) => r !== Role.UNKNOWN)
                        .map((r) => (
                          <button
                            key={r}
                            onClick={() => handleManualRoleChange(spell.name, r)}
                            className="text-xs text-left px-2 py-1.5 hover:bg-gray-700 text-gray-300 rounded flex items-center gap-2"
                          >
                            {getRoleIcon(r)} {r}
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-black/40 rounded p-1.5 flex flex-col relative overflow-hidden">
                      <span className="text-[10px] text-gray-500 uppercase">Avg Dmg</span>
                      <span className="text-sm font-mono text-red-300">
                        {(spell.avgDamage / 1000).toFixed(1)}k
                      </span>
                      <div
                        className="absolute bottom-0 left-0 h-0.5 bg-red-800"
                        style={{ width: `${damagePercent}%` }}
                      />
                    </div>
                    <div className="bg-black/40 rounded p-1.5 flex flex-col relative overflow-hidden">
                      <span className="text-[10px] text-gray-500 uppercase">Hits</span>
                      <span className="text-sm font-mono text-yellow-300">{spell.count}</span>
                      <div
                        className="absolute bottom-0 left-0 h-0.5 bg-yellow-600"
                        style={{ width: `${countPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-white/5">
                    <span className="truncate max-w-full">
                      Targets: {Array.from(spell.targets).slice(0, 3).join(', ')}
                      {spell.targets.size > 3 ? '...' : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const OutgoingSection = () => {
    const friendlySpells = data.spells
      .filter((s) => s.category === 'friendly')
      .filter((s) => !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.totalDamage - a.totalDamage);

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-full flex flex-col">
        <h3 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
          ⚔️ Outgoing Damage (Players → Enemies)
        </h3>
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs uppercase bg-gray-800 text-gray-500 sticky top-0">
              <tr>
                <th className="p-3">Spell</th>
                <th className="p-3">Source</th>
                <th className="p-3">Targets</th>
                <th className="p-3 text-right">Count</th>
                <th className="p-3 text-right">Avg Dmg</th>
                <th className="p-3 text-right">Total Dmg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {friendlySpells.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center italic">
                    {searchTerm ? 'No spells match search.' : 'No player damage events found.'}
                  </td>
                </tr>
              )}
              {friendlySpells.map((spell) => (
                <tr key={spell.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-3 font-medium text-white">
                    {spell.name}
                    <span className="ml-2 text-[10px] text-gray-600 font-mono opacity-0 group-hover:opacity-100">
                      #{spell.id}
                    </span>
                  </td>
                  <td className="p-3 text-blue-400">{spell.source}</td>
                  <td className="p-3">{Array.from(spell.targets).slice(0, 3).join(', ')}</td>
                  <td className="p-3 text-right">{spell.count}</td>
                  <td className="p-3 text-right">{(spell.avgDamage / 1000).toFixed(1)}k</td>
                  <td className="p-3 text-right text-red-400 font-mono">
                    {(spell.totalDamage / 1000000).toFixed(2)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 p-1 bg-gray-800 rounded-lg border border-gray-700">
            <button
              onClick={() => setViewMode('incoming')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-all text-sm ${viewMode === 'incoming' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              ⬇️ Incoming
            </button>
            <button
              onClick={() => setViewMode('outgoing')}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-all text-sm ${viewMode === 'outgoing' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              ⬆️ Outgoing
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search spell..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 w-48"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
        </div>

        {viewMode === 'incoming' && (
          <div className="flex items-center gap-2 bg-gray-800 p-1 px-3 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400 font-medium mr-2">Filter Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | 'All')}
              className="bg-transparent text-white text-sm focus:outline-none cursor-pointer py-1"
            >
              <option value="All">All Roles</option>
              {Object.values(Role)
                .filter((r) => r !== Role.UNKNOWN)
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {loading && viewMode === 'incoming' ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner
            size="xl"
            variant="default"
            message="Analyzing Combat Log"
            subMessage="Categorizing enemy abilities by role..."
          />
        </div>
      ) : (
        <div className="flex-1 h-full pb-4">
          {viewMode === 'incoming' ? (
            <div
              className={`grid gap-4 h-full ${roleFilter === 'All' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}
            >
              {(roleFilter === 'All' || roleFilter === Role.TANK) && (
                <RoleSection
                  role={Role.TANK}
                  title="Tank Busters"
                  colorClass="text-blue-400"
                  expanded={roleFilter === Role.TANK}
                />
              )}
              {(roleFilter === 'All' || roleFilter === Role.MELEE) && (
                <RoleSection
                  role={Role.MELEE}
                  title="Melee Mechanics"
                  colorClass="text-red-400"
                  expanded={roleFilter === Role.MELEE}
                />
              )}
              {(roleFilter === 'All' || roleFilter === Role.RANGED) && (
                <RoleSection
                  role={Role.RANGED}
                  title="Ranged/Caster"
                  colorClass="text-purple-400"
                  expanded={roleFilter === Role.RANGED}
                />
              )}
              {(roleFilter === 'All' || roleFilter === Role.HEALER) && (
                <RoleSection
                  role={Role.HEALER}
                  title="Healer Checks"
                  colorClass="text-green-400"
                  expanded={roleFilter === Role.HEALER}
                />
              )}
            </div>
          ) : (
            <OutgoingSection />
          )}
        </div>
      )}
    </div>
  );
};

export default AbilitiesTab;
