import React, { useContext } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppContext } from '../contexts/AppContext';

const PerkItem: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="bg-wow-gray-900 p-6 rounded-lg border-2 border-wow-gray-700 transition-all duration-300 hover:border-wow-gold hover:shadow-gold-glow">
    <h3 className="text-xl font-bold text-wow-gold tracking-wider mb-2">{title}</h3>
    <p className="text-gray-300 leading-relaxed">{text}</p>
  </div>
);

export default function GuildPerksPage() {
  const { t } = useLanguage();
  const context = useContext(AppContext);

  const userGuild = context?.guilds.find((g) => g.id === context.authenticatedUser?.guildId);
  const hasDynamicPerks = userGuild?.perks && userGuild.perks.length > 0;

  const defaultPerks = [
    { title: t('perk_1_title'), text: t('perk_1_text') },
    { title: t('perk_2_title'), text: t('perk_2_text') },
    { title: t('perk_3_title'), text: t('perk_3_text') },
    { title: t('perk_4_title'), text: t('perk_4_text') },
    { title: t('perk_5_title'), text: t('perk_5_text') },
    { title: t('perk_6_title'), text: t('perk_6_text') },
  ];

  const perksToDisplay = hasDynamicPerks ? userGuild.perks! : defaultPerks;

  return (
    <div className="font-cinzel">
      <div className="wow-panel">
        <h1 className="text-3xl md:text-4xl font-bold text-wow-gold text-center tracking-wider">
          {t('perks_header')}
        </h1>
        <p className="text-center text-gray-300 mt-2 mb-10 max-w-3xl mx-auto">{t('perks_subheader')}</p>

        {hasDynamicPerks ? (
          <div className="text-center mb-8">
            <span className="bg-wow-blue/20 text-wow-blue border border-wow-blue px-3 py-1 rounded-full text-xs uppercase tracking-widest">
              {userGuild.name} Exclusive
            </span>
          </div>
        ) : (
          <div className="text-center mb-8">
            <span className="text-gray-500 text-xs uppercase tracking-widest">General Benefits</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perksToDisplay.map((perk, index) => (
            <PerkItem key={index} title={perk.title} text={perk.text} />
          ))}
        </div>
      </div>
    </div>
  );
}
