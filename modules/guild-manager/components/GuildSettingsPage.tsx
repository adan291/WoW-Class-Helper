import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomQuestion, GuildPerk, UserRole } from '../types';

const ListManager: React.FC<{
  title: string;
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
}> = ({ title, items, setItems, placeholder }) => {
  const { t } = useLanguage();
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  return (
    <div className="border-t border-wow-brown-dark/20 dark:border-wow-gray-700 pt-4">
      <h3 className="text-lg font-bold text-wow-brown-dark dark:text-wow-gold mb-2">{title}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between bg-wow-parchment-dark dark:bg-wow-gray-800 p-2 rounded"
          >
            <p className="text-wow-brown-dark dark:text-gray-300">{item}</p>
            <button
              onClick={() => setItems(items.filter((i) => i !== item))}
              className="text-red-600 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 text-xs font-bold"
            >
              {t('guild_settings_remove_button')}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="wow-input w-full"
          placeholder={placeholder}
        />
        <button onClick={handleAddItem} className="wow-button !py-2 !px-4">
          {t('guild_settings_add_button')}
        </button>
      </div>
    </div>
  );
};

const PerksManager: React.FC<{ perks: GuildPerk[]; setPerks: (perks: GuildPerk[]) => void }> = ({
  perks,
  setPerks,
}) => {
  const { t } = useLanguage();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = () => {
    if (newTitle.trim() && newDesc.trim()) {
      setPerks([...perks, { title: newTitle, text: newDesc }]);
      setNewTitle('');
      setNewDesc('');
    }
  };

  return (
    <div className="border-t border-wow-brown-dark/20 dark:border-wow-gray-700 pt-4">
      <h3 className="text-lg font-bold text-wow-brown-dark dark:text-wow-gold mb-2">
        {t('guild_settings_perks_title')}
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 mb-4">
        {perks.map((p, i) => (
          <div
            key={i}
            className="bg-wow-parchment-dark dark:bg-wow-gray-800 p-3 rounded flex justify-between items-start"
          >
            <div>
              <strong className="block text-wow-gold">{p.title}</strong>
              <span className="text-sm text-gray-400">{p.text}</span>
            </div>
            <button
              onClick={() => setPerks(perks.filter((_, idx) => idx !== i))}
              className="text-red-500 hover:text-red-300 text-xs font-bold ml-2"
            >
              X
            </button>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="wow-input w-full"
          placeholder={t('guild_settings_perk_title_ph')}
        />
        <textarea
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="wow-input w-full"
          placeholder={t('guild_settings_perk_desc_ph')}
          rows={2}
        />
        <button onClick={handleAdd} className="wow-button w-full">
          {t('guild_settings_add_button')}
        </button>
      </div>
    </div>
  );
};

// Form state interface
interface GuildFormState {
  guildName: string;
  description: string;
  email: string;
  questions: CustomQuestion[];
  raidExperiences: string[];
  availabilitySlots: string[];
  perks: GuildPerk[];
}

export default function GuildSettingsPage() {
  const { t } = useLanguage();
  const context = useContext(AppContext);
  const navigate = useNavigate();

  // Get current guild data
  const currentGuild = context?.guilds.find((g) => g.id === context?.authenticatedUser?.guildId);

  // Combined form state with lazy initialization
  const [formState, setFormState] = useState<GuildFormState>(() => ({
    guildName: currentGuild?.name || '',
    description: currentGuild?.description || '',
    email: currentGuild?.officerEmail || '',
    questions: currentGuild?.customQuestions || [],
    raidExperiences: currentGuild?.raidExperiences || [],
    availabilitySlots: currentGuild?.availabilitySlots || [],
    perks: currentGuild?.perks || [],
  }));

  const [newQuestion, setNewQuestion] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Destructure for easier access
  const { guildName, description, email, questions, raidExperiences, availabilitySlots, perks } =
    formState;

  // Helper to update form fields
  const updateField = <K extends keyof GuildFormState>(field: K, value: GuildFormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Navigation guards
  useEffect(() => {
    if (!context?.authenticatedUser) {
      navigate('/login');
      return;
    }
    if (
      context.authenticatedUser.role === UserRole.MEMBER ||
      context.authenticatedUser.role === UserRole.USER
    ) {
      navigate('/guild-manager');
      return;
    }
    if (!currentGuild) {
      navigate('/guild-manager');
    }
  }, [context?.authenticatedUser, currentGuild, navigate]);

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      updateField('questions', [
        ...questions,
        { id: `q_${Date.now()}`, label: newQuestion.trim() },
      ]);
      setNewQuestion('');
    }
  };

  const handleSave = () => {
    if (context?.authenticatedUser && context.authenticatedUser.guildId) {
      context.updateGuildDetails(context.authenticatedUser.guildId, {
        name: guildName,
        description,
        officerEmail: email,
        customQuestions: questions,
        raidExperiences,
        availabilitySlots,
        perks,
      });
      setSuccessMessage(t('guild_settings_save_success'));
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (!context?.authenticatedUser) return null;

  return (
    <div className="font-cinzel">
      <div className="wow-panel w-full max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-wow-brown-dark dark:text-wow-gold">
            {t('guild_settings_header')}
          </h1>
          <p className="text-center text-wow-brown dark:text-gray-300 mt-2 mb-8">
            {t('guild_settings_subheader')}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-wow-brown-dark dark:text-wow-gold mb-2">
                {t('guild_settings_general_title')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-wow-brown-light dark:text-wow-gold tracking-wider mb-1">
                    {t('guild_settings_name_label')}
                  </label>
                  <input
                    type="text"
                    value={guildName}
                    onChange={(e) => updateField('guildName', e.target.value)}
                    className="wow-input w-full"
                    disabled={context.authenticatedUser.role !== UserRole.ADMIN}
                  />
                  {context.authenticatedUser.role !== UserRole.ADMIN && (
                    <p className="text-xs text-yellow-500 mt-1">
                      Only Guild Master can change name.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-wow-brown-light dark:text-wow-gold tracking-wider mb-1">
                    {t('guild_settings_desc_label')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="wow-input w-full"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-wow-brown-dark dark:text-wow-gold mb-2">
                {t('guild_settings_email_title')}
              </h3>
              <label
                htmlFor="guildEmail"
                className="block text-sm text-wow-brown-light dark:text-wow-gold tracking-wider mb-1"
              >
                {t('guild_settings_email_label')}
              </label>
              <input
                id="guildEmail"
                type="email"
                value={email}
                onChange={(e) => updateField('email', e.target.value)}
                className="wow-input w-full"
                placeholder={t('guild_settings_email_placeholder')}
              />
              <p className="text-xs text-wow-brown/80 dark:text-gray-400 mt-1">
                {t('guild_settings_email_desc')}
              </p>
            </div>
            <PerksManager perks={perks} setPerks={(newPerks) => updateField('perks', newPerks)} />
          </div>

          <div className="space-y-6">
            <div className="border-t border-wow-brown-dark/20 dark:border-wow-gray-700 pt-4 lg:pt-0 lg:border-t-0">
              <h3 className="text-lg font-bold text-wow-brown-dark dark:text-wow-gold mb-2">
                {t('guild_settings_questions_title')}
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between bg-wow-parchment-dark dark:bg-wow-gray-800 p-2 rounded"
                  >
                    <p className="text-wow-brown-dark dark:text-gray-300">{q.label}</p>
                    <button
                      onClick={() =>
                        updateField(
                          'questions',
                          questions.filter((qst) => qst.id !== q.id)
                        )
                      }
                      className="text-red-600 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 text-xs font-bold"
                    >
                      {t('guild_settings_remove_button')}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="wow-input w-full"
                  placeholder={t('guild_settings_questions_add_placeholder')}
                />
                <button onClick={handleAddQuestion} className="wow-button !py-2 !px-4">
                  {t('guild_settings_add_button')}
                </button>
              </div>
            </div>
            <ListManager
              title={t('guild_settings_raids_title')}
              items={raidExperiences}
              setItems={(items) => updateField('raidExperiences', items)}
              placeholder={t('guild_settings_raids_add_placeholder')}
            />
            <ListManager
              title={t('guild_settings_availability_title')}
              items={availabilitySlots}
              setItems={(items) => updateField('availabilitySlots', items)}
              placeholder={t('guild_settings_availability_add_placeholder')}
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 pt-6 mt-8 border-t border-wow-brown-dark/20 dark:border-wow-gray-700">
          {successMessage && (
            <p className="text-green-400 text-sm animate-fade-in">{successMessage}</p>
          )}
          <button onClick={handleSave} className="wow-button text-base">
            {t('guild_settings_save_button')}
          </button>
        </div>
      </div>
    </div>
  );
}
