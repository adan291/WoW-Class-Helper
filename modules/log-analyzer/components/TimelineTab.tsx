import React from 'react';
import { LogSummary } from '../types';

interface Props {
  data: LogSummary;
}

const TimelineTab: React.FC<Props> = ({ data }) => {
  const relevantSpells = data.spells.filter((s) => s.category === 'hostile');
  const uniqueSpells = Array.from(new Set(relevantSpells.map((s) => s.name)));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const maxTime = Math.max(...relevantSpells.flatMap((s) => s.timestamp), 1);
  const maxDamage = Math.max(...relevantSpells.map((s) => s.avgDamage), 1);

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Encounter Timeline (Hostile Spells)</h2>

      <div className="flex-1 overflow-auto">
        {/* Simple Timeline Visualization */}
        <div className="relative min-h-[400px]">
          {/* Time axis */}
          <div className="absolute top-0 left-40 right-4 h-8 border-b border-gray-700 flex justify-between text-xs text-gray-500">
            <span>0:00</span>
            <span>{formatTime(maxTime / 4)}</span>
            <span>{formatTime(maxTime / 2)}</span>
            <span>{formatTime((maxTime * 3) / 4)}</span>
            <span>{formatTime(maxTime)}</span>
          </div>

          {/* Spell rows */}
          <div className="pt-10 space-y-2">
            {uniqueSpells.map((spellName) => {
              const spell = relevantSpells.find((s) => s.name === spellName);
              if (!spell) return null;

              return (
                <div key={spellName} className="flex items-center gap-4 h-10">
                  {/* Spell name */}
                  <div className="w-36 text-sm text-gray-300 truncate" title={spellName}>
                    {spellName}
                  </div>

                  {/* Timeline bar */}
                  <div className="flex-1 relative h-8 bg-gray-800 rounded">
                    {spell.timestamp.map((time, idx) => {
                      const left = (time / maxTime) * 100;
                      const size = Math.max(8, Math.min(20, (spell.avgDamage / maxDamage) * 20));

                      return (
                        <div
                          key={idx}
                          className="absolute top-1/2 -translate-y-1/2 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer transition-colors"
                          style={{
                            left: `${left}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            transform: `translate(-50%, -50%)`,
                          }}
                          title={`${spellName} at ${formatTime(time)} - ${(spell.avgDamage / 1000).toFixed(1)}k avg`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700">
        <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Legend</h4>
        <div className="flex gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>Ability Cast / Damage Event</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-yellow-500"></span>
            <span>Bubble size = Relative Damage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineTab;
