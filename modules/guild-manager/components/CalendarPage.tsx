import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { GuildEvent, UserRole } from '../types';

const EventModal: React.FC<{
  onClose: () => void;
  onSave: (event: Omit<GuildEvent, 'id'>) => void;
}> = ({ onClose, onSave }) => {
  const { t } = useLanguage();
  const context = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'Raid' | 'Mythic+' | 'PvP' | 'Social'>('Raid');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && date && context?.authenticatedUser?.guildId) {
      onSave({
        title,
        date: new Date(date),
        type,
        description,
        guildId: context.authenticatedUser.guildId,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="wow-panel w-full max-w-md font-cinzel">
        <h2 className="text-2xl font-bold text-wow-gold mb-4">{t('calendar_modal_title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('calendar_event_title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="wow-input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('calendar_event_date')}</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="wow-input w-full text-wow-brown-dark"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('calendar_event_type')}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'Raid' | 'Mythic+' | 'PvP' | 'Social')}
              className="wow-input w-full"
            >
              <option value="Raid">Raid</option>
              <option value="Mythic+">Mythic+</option>
              <option value="PvP">PvP</option>
              <option value="Social">Social</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('calendar_event_desc')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="wow-input w-full"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              {t('roster_notes_modal_close')}
            </button>
            <button type="submit" className="wow-button">
              {t('calendar_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const { t } = useLanguage();
  const context = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = useMemo(() => {
    const d = [];
    for (let i = 0; i < firstDayOfMonth; i++) d.push(null);
    for (let i = 1; i <= daysInMonth; i++) d.push(new Date(year, month, i));
    return d;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  const monthEvents = useMemo(() => {
    if (!context) return [];
    const guildId = context.authenticatedUser?.guildId;
    return context.events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year && e.guildId === guildId;
    });
  }, [context, month, year]);

  const canEdit =
    context?.authenticatedUser?.role === UserRole.ADMIN ||
    context?.authenticatedUser?.role === UserRole.OFFICER;

  const changeMonth = (offset: number) => setCurrentDate(new Date(year, month + offset, 1));

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Raid':
        return 'bg-red-900/80 border-red-500 text-red-100';
      case 'Mythic+':
        return 'bg-purple-900/80 border-purple-500 text-purple-100';
      case 'PvP':
        return 'bg-blue-900/80 border-blue-500 text-blue-100';
      default:
        return 'bg-green-900/80 border-green-500 text-green-100';
    }
  };

  return (
    <div className="font-cinzel">
      <div className="wow-panel">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-wow-gold">{t('calendar_header')}</h1>
            <p className="text-gray-400">{t('calendar_subheader')}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center bg-black/40 rounded-lg p-1">
              <button
                onClick={() => changeMonth(-1)}
                className="px-3 py-1 text-wow-gold hover:bg-white/10 rounded"
              >
                &lt;
              </button>
              <span className="px-4 font-bold text-white min-w-[150px] text-center">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="px-3 py-1 text-wow-gold hover:bg-white/10 rounded"
              >
                &gt;
              </button>
            </div>
            {canEdit && (
              <button onClick={() => setIsModalOpen(true)} className="wow-button !py-2 !px-4">
                {t('calendar_add_event')}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 bg-wow-brown-dark/20 dark:bg-black/40 p-2 rounded-lg">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="text-center py-2 font-bold text-wow-brown-dark dark:text-gray-400 uppercase text-sm"
            >
              {d}
            </div>
          ))}
          {days.map((date, idx) => {
            if (!date)
              return (
                <div key={`empty-${idx}`} className="bg-black/10 min-h-[100px] rounded-sm"></div>
              );
            const dayEvents = monthEvents.filter(
              (e) => new Date(e.date).getDate() === date.getDate()
            );
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div
                key={idx}
                className={`min-h-[120px] bg-wow-parchment-light dark:bg-wow-gray-800/50 border border-wow-brown-light/20 dark:border-wow-gray-700 p-2 rounded-sm relative group hover:bg-white/10 transition-colors ${isToday ? 'ring-2 ring-wow-gold ring-inset' : ''}`}
              >
                <span
                  className={`text-sm font-bold ${isToday ? 'text-wow-gold' : 'text-gray-500'}`}
                >
                  {date.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate relative group/event cursor-pointer`}
                    >
                      <span className="font-bold">
                        {new Date(event.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>{' '}
                      {event.title}
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            context?.deleteEvent(event.id);
                          }}
                          className="absolute top-0 right-0 bottom-0 px-1 bg-red-600 text-white hidden group-hover/event:flex items-center"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isModalOpen && (
        <EventModal
          onClose={() => setIsModalOpen(false)}
          onSave={context?.addEvent || (() => {})}
        />
      )}
    </div>
  );
}
