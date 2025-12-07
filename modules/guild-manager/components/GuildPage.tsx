import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserRole } from '../types';

const SettingsIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const DiscordLogo = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M524.531,69.836a1.5,1.5,0,0,0-2.121.121L460.488,160.635c-18.448-10.43-38.688-16.469-60.458-18.448-1.776-.16-3.312-.16-4.576,0-21.52,1.92-41.568,7.872-60.288,18.208L274.6,70.1a1.5,1.5,0,0,0-2.121-.121L223.363,114.16a1.5,1.5,0,0,0-.24,2.24l26.432,38.592c-18.976,12.064-36.256,27.328-50.816,45.376-1.5,1.824-.64,4.416,1.536,5.536L228.483,234c9.568,4.8,19.648,8.64,30.144,11.52,10.24,2.688,20.736,4.032,31.488,4.032s21.248-1.344,31.488-4.032c10.496-2.88,20.608-6.72,30.144-11.52l27.936-17.632a1.5,1.5,0,0,0,1.536-5.536c-14.56-18.048-31.84-33.312-50.816-45.376l26.432-38.592a1.5,1.5,0,0,0-.24-2.24L524.531,69.836ZM222.443,300.224c-11.776,0-21.504-10.976-21.504-24.544s9.728-24.544,21.504-24.544,21.504,10.976,21.504,24.544S234.219,300.224,222.443,300.224Zm195.112,0c-11.776,0-21.504-10.976-21.504-24.544s9.728-24.544,21.504-24.544,21.504,10.976,21.504,24.544S429.331,300.224,417.555,300.224Z"></path>
  </svg>
);

export default function GuildPage() {
  const context = useContext(AppContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!context?.authenticatedUser) {
      navigate('/login');
    }
  }, [context?.authenticatedUser, navigate]);

  if (!context?.authenticatedUser) return null;

  const { role, guildId, guildName } = context.authenticatedUser;
  const currentGuild = context.guilds.find((g) => g.id === guildId);

  if (!guildId) {
    return (
      <div className="font-cinzel flex flex-col items-center justify-center pt-10 px-4">
        <div className="wow-panel text-center max-w-2xl w-full py-16">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-wow-gray-900 border-4 border-gray-600 flex items-center justify-center text-4xl text-gray-500">?</div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-wow-brown-dark dark:text-wow-gold mb-6">{t('guild_no_guild_header')}</h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">{t('guild_no_guild_text')}</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/guild-manager/apply" className="wow-button text-lg px-10 py-4 bg-wow-gold text-wow-gray-900 hover:scale-105 shadow-[0_0_20px_rgba(240,185,10,0.3)]">{t('guild_apply_now')}</Link>
          </div>
        </div>
      </div>
    );
  }

  const canModify = role === UserRole.ADMIN || role === UserRole.OFFICER;

  return (
    <div className="font-cinzel">
      <div className="wow-panel">
        <div className="text-center mb-12 border-b border-wow-brown-dark/20 dark:border-wow-gray-700 pb-8 relative">
          <h1 className="text-4xl md:text-6xl font-bold text-wow-brown-dark dark:text-wow-gold tracking-widest mb-2 uppercase drop-shadow-md">{currentGuild?.name || guildName}</h1>
          <p className="text-xl text-wow-brown-light dark:text-wow-gold-dark italic mb-6 max-w-2xl mx-auto">"{currentGuild?.description}"</p>
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-wow-gold/30 bg-black/30 text-wow-gold text-sm tracking-widest uppercase">Rank: {role}</div>
          <div className="absolute top-0 right-0 hidden md:block">
            <button onClick={context.linkDiscord} disabled={!!context.authenticatedUser.discordId} className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-all ${context.authenticatedUser.discordId ? 'bg-indigo-900/40 text-indigo-300 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
              <DiscordLogo />
              {context.authenticatedUser.discordId ? (
                <span className="flex flex-col items-start leading-none">
                  <span>{t('guild_discord_connected')}</span>
                  <span className="text-[10px] opacity-70">{context.authenticatedUser.discordId}</span>
                </span>
              ) : t('guild_discord_connect')}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl text-wow-brown-dark dark:text-gray-300 border-l-4 border-wow-gold pl-4 uppercase tracking-wider">{canModify ? 'Guild Management' : 'Guild Information'}</h2>
              {canModify ? (
                <>
                  <Link to="/guild-manager/guild/settings" className="block group relative overflow-hidden rounded-lg bg-black/40 border-2 border-wow-brown-light/30 hover:border-wow-gold transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-wow-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-8 flex items-start gap-6">
                      <div className="p-4 bg-wow-gold/10 rounded-full text-wow-gold text-3xl group-hover:rotate-90 transition-transform duration-500"><SettingsIcon /></div>
                      <div>
                        <h3 className="text-2xl font-bold text-wow-gold mb-2 group-hover:text-white transition-colors">{t('guild_edit_form_button')}</h3>
                        <p className="text-gray-400 text-sm">Update guild name, description, perks, and recruitment questions.</p>
                      </div>
                    </div>
                  </Link>
                  <Link to="/guild-manager/admin" className="block group relative overflow-hidden rounded-lg bg-black/40 border-2 border-wow-brown-light/30 hover:border-blue-400 transition-all duration-300">
                    <div className="p-8 flex items-start gap-6">
                      <div className="p-4 bg-blue-500/10 rounded-full text-blue-400 text-3xl"><SettingsIcon /></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-2xl font-bold text-blue-400 mb-2 group-hover:text-white transition-colors">{t('guild_view_recruitment')}</h3>
                          {context.notifications.length > 0 && <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">{context.notifications.length} NEW</span>}
                        </div>
                        <p className="text-gray-400 text-sm">Review pending applications and manage new recruits.</p>
                      </div>
                    </div>
                  </Link>
                </>
              ) : (
                <div className="p-6 bg-wow-parchment-dark/50 dark:bg-black/30 rounded-lg border border-wow-brown-light/30">
                  <p className="text-gray-400 italic">"United we stand, divided we fall."</p>
                  <p className="mt-4 text-sm text-wow-brown dark:text-gray-500">As a member, you can view the roster and benefits, but only officers can modify guild settings.</p>
                </div>
              )}
              <div className="bg-wow-parchment-dark/50 dark:bg-black/30 rounded-lg border border-wow-brown-light/30 overflow-hidden">
                <div className="bg-indigo-900/30 p-3 border-b border-indigo-500/30 flex justify-between items-center">
                  <h3 className="text-indigo-300 font-bold flex items-center gap-2"><DiscordLogo /> {t('guild_announcements_title')}</h3>
                </div>
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {currentGuild?.announcements?.map((announcement) => (
                    <div key={announcement.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-300 border border-gray-600">{announcement.author.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-wow-gold font-bold text-sm">{announcement.author}</span>
                          <span className="text-xs text-gray-500">{new Date(announcement.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{announcement.content}</p>
                      </div>
                    </div>
                  ))}
                  {!currentGuild?.announcements?.length && <p className="text-gray-500 text-center text-sm py-4">No recent announcements.</p>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl text-wow-brown-dark dark:text-gray-300 border-l-4 border-green-500 pl-4 uppercase tracking-wider">Community</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/guild-manager/roster" className="group p-6 bg-wow-parchment-dark/50 dark:bg-black/30 rounded-lg border border-wow-brown-light/30 hover:bg-wow-parchment-dark dark:hover:bg-wow-gray-800 transition-all text-center">
                  <div className="text-4xl text-green-500 mb-3 group-hover:scale-110 transition-transform mx-auto w-fit">🛡️</div>
                  <h3 className="text-lg font-bold text-wow-brown-dark dark:text-gray-200">{t('guild_view_roster')}</h3>
                </Link>
                <Link to="/guild-manager/perks" className="group p-6 bg-wow-parchment-dark/50 dark:bg-black/30 rounded-lg border border-wow-brown-light/30 hover:bg-wow-parchment-dark dark:hover:bg-wow-gray-800 transition-all text-center">
                  <div className="text-4xl text-purple-500 mb-3 group-hover:scale-110 transition-transform mx-auto w-fit">✨</div>
                  <h3 className="text-lg font-bold text-wow-brown-dark dark:text-gray-200">{t('guild_view_perks')}</h3>
                </Link>
                <Link to="/guild-manager/calendar" className="col-span-1 sm:col-span-2 group p-6 bg-wow-parchment-dark/50 dark:bg-black/30 rounded-lg border border-wow-brown-light/30 hover:bg-wow-parchment-dark dark:hover:bg-wow-gray-800 transition-all text-center flex items-center justify-center gap-4">
                  <div className="text-4xl text-wow-gold mb-0 group-hover:scale-110 transition-transform">📅</div>
                  <h3 className="text-lg font-bold text-wow-brown-dark dark:text-gray-200">{t('guild_calendar_link')}</h3>
                </Link>
              </div>
              <div className="p-6 bg-gradient-to-br from-wow-blue-dark/20 to-transparent rounded-lg border border-wow-blue/30">
                <h3 className="text-wow-blue font-bold mb-2">Guild Motd</h3>
                <p className="text-sm text-gray-400 italic">"Raid invites go out at 7:45 PM Server Time. Bring consumables!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
