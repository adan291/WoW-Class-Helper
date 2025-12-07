import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  WOW_CLASSES,
  RAID_EXPERIENCES as DEFAULT_RAID_EXPERIENCES,
  AVAILABILITY_SLOTS as DEFAULT_AVAILABILITY_SLOTS,
} from '../constants';
import { Role, WoWSpec, CustomQuestion, Application } from '../types';

const FormInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string }
> = ({ id, label, error, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm text-wow-brown-light dark:text-wow-gold tracking-wider mb-1"
    >
      {label}
    </label>
    <input id={id} {...props} className={`wow-input w-full ${error ? 'border-red-500' : ''}`} />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const FormSelect: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    id: string;
    label: string;
    children: React.ReactNode;
    error?: string;
  }
> = ({ id, label, children, error, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm text-wow-brown-light dark:text-wow-gold tracking-wider mb-1"
    >
      {label}
    </label>
    <select id={id} {...props} className={`wow-input w-full ${error ? 'border-red-500' : ''}`}>
      {children}
    </select>
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const FormTextarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string; error?: string }
> = ({ id, label, error, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm text-wow-brown-light dark:text-wow-gold tracking-wider mb-1"
    >
      {label}
    </label>
    <textarea
      id={id}
      {...props}
      rows={4}
      className={`wow-input w-full ${error ? 'border-red-500' : ''}`}
    />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const PortalAnimation: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-500">
      <div className="relative w-80 h-80">
        <div
          className="portal-gradient-ring absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 rounded-full blur-xl animate-spin"
          style={{ animationDuration: '6s' }}
        ></div>
        <div className="portal-core absolute inset-2 bg-wow-gray-900 rounded-full flex flex-col items-center justify-center text-center p-4 animate-pulse">
          <h3 className="text-2xl font-cinzel text-wow-gold">{t('apply_portal_header')}</h3>
          <p className="text-gray-300 mt-4">{t('apply_portal_text')}</p>
        </div>
      </div>
    </div>
  );
};

export default function ApplyPage() {
  const { id: applicationId } = useParams();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const { t } = useLanguage();
  const isEditMode = !!applicationId;

  const [formData, setFormData] = useState({
    guildId: '',
    guildName: '',
    playerName: '',
    wowClass: '',
    wowSpec: '',
    itemLevel: '',
    raidExperience: [] as string[],
    logsUrl: '',
    availability: [] as string[],
    role: Role.DPS,
    reason: '',
    customAnswers: {} as Record<string, string>,
  });

  const [specs, setSpecs] = useState<WoWSpec[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [raidOptions, setRaidOptions] = useState<string[]>(DEFAULT_RAID_EXPERIENCES);
  const [availabilityOptions, setAvailabilityOptions] = useState<string[]>(
    DEFAULT_AVAILABILITY_SLOTS
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const availableGuilds = context?.guilds.filter((g) => g.officerEmail) || [];

  useEffect(() => {
    if (isEditMode) {
      if (!context?.authenticatedUser) {
        navigate('/login');
        return;
      }
      const appToEdit = context.applications.find((app) => app.id === applicationId);
      if (appToEdit) {
        const selectedGuild = context.guilds.find((g) => g.id === appToEdit.guildId);
        if (selectedGuild) {
          setCustomQuestions(selectedGuild.customQuestions || []);
          setRaidOptions(selectedGuild.raidExperiences || DEFAULT_RAID_EXPERIENCES);
          setAvailabilityOptions(selectedGuild.availabilitySlots || DEFAULT_AVAILABILITY_SLOTS);
        }
        setFormData({
          guildId: appToEdit.guildId,
          guildName: appToEdit.guildName,
          playerName: appToEdit.playerName,
          wowClass: appToEdit.wowClass,
          wowSpec: appToEdit.wowSpec,
          itemLevel: String(appToEdit.itemLevel),
          raidExperience: appToEdit.raidExperience,
          logsUrl: appToEdit.logsUrl,
          availability: appToEdit.availability,
          role: appToEdit.role,
          reason: appToEdit.reason,
          customAnswers: appToEdit.customAnswers || {},
        });
        const selectedClass = WOW_CLASSES.find((c) => c.name === appToEdit.wowClass);
        if (selectedClass) setSpecs(selectedClass.specs);
      } else {
        navigate('/guild-manager/admin');
      }
    }
  }, [
    applicationId,
    isEditMode,
    context?.authenticatedUser,
    context?.applications,
    context?.guilds,
    navigate,
  ]);

  const validate = useCallback(() => {
    return Object.keys(formErrors).length === 0;
  }, [formErrors]);

  // Validation runs on form data change via useMemo pattern
  const validationErrors = React.useMemo(() => {
    const errors: Record<string, string> = {};
    if (!formData.guildId) errors.guildId = t('validation_guild');
    if (!formData.playerName) errors.playerName = t('validation_playerName');
    if (!formData.wowClass) errors.wowClass = t('validation_class');
    if (!formData.wowSpec) errors.wowSpec = t('validation_spec');
    if (!formData.itemLevel || +formData.itemLevel < 450)
      errors.itemLevel = t('validation_itemLevel');
    if (!formData.logsUrl.startsWith('https://www.warcraftlogs.com/'))
      errors.logsUrl = t('validation_logsUrl');
    if (formData.availability.length === 0) errors.availability = t('validation_availability');
    if (formData.reason.length < 10) errors.reason = t('validation_reason');
    customQuestions.forEach((q) => {
      if (!formData.customAnswers[q.id]?.trim())
        errors[`custom_${q.id}`] = t('validation_custom_required');
    });
    return errors;
  }, [formData, t, customQuestions]);

  // Sync validation errors to state when they change
  useEffect(() => {
    setFormErrors(validationErrors);
  }, [validationErrors]);

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setTouched((prev) => ({ ...prev, [e.target.id]: true }));
  };

  const markTouched = (fieldId: string) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = WOW_CLASSES.find((c) => c.name === e.target.value);
    setFormData({ ...formData, wowClass: e.target.value, wowSpec: '' });
    setSpecs(selectedClass ? selectedClass.specs : []);
    markTouched(e.target.id);
  };

  const handleMultiSelectChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'raidExperience' | 'availability'
  ) => {
    const { value, checked } = e.target;
    const currentValues = formData[field];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    setFormData({ ...formData, [field]: newValues });
    setTouched((prev) => ({ ...prev, availability: true }));
  };

  const handleGuildChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const guildId = e.target.value;
    const selectedGuild = availableGuilds.find((g) => g.id === guildId);
    setFormData({ ...formData, guildId, guildName: selectedGuild?.name || '', customAnswers: {} });
    setCustomQuestions(selectedGuild?.customQuestions || []);
    setRaidOptions(selectedGuild?.raidExperiences || DEFAULT_RAID_EXPERIENCES);
    setAvailabilityOptions(selectedGuild?.availabilitySlots || DEFAULT_AVAILABILITY_SLOTS);
    markTouched(e.target.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = {
      guildId: true,
      playerName: true,
      wowClass: true,
      wowSpec: true,
      itemLevel: true,
      logsUrl: true,
      availability: true,
      reason: true,
    };
    customQuestions.forEach((q) => (allTouched[`custom_${q.id}`] = true));
    setTouched(allTouched);

    if (validate()) {
      if (isEditMode && applicationId) {
        const originalApp = context?.applications.find((app) => app.id === applicationId);
        if (originalApp) {
          const updatedApplication: Application = {
            ...originalApp,
            ...formData,
            itemLevel: +formData.itemLevel,
          };
          context?.updateApplication(applicationId, updatedApplication);
          setUpdateSuccess(true);
          setTimeout(() => {
            setUpdateSuccess(false);
            navigate('/guild-manager/admin');
          }, 3000);
        }
      } else {
        context?.addApplication({ ...formData, itemLevel: +formData.itemLevel });
        setIsSubmitted(true);
      }
    }
  };

  const selectedClassData = WOW_CLASSES.find((c) => c.name === formData.wowClass);

  return (
    <div className="font-cinzel">
      {isSubmitted && <PortalAnimation onClose={() => setIsSubmitted(false)} />}
      <div className="wow-panel">
        <h1 className="text-3xl md:text-4xl font-bold text-wow-brown-dark dark:text-wow-gold text-center tracking-wider">
          {isEditMode ? `${t('apply_header_edit')} ${formData.playerName}` : t('apply_header')}
        </h1>
        {!isEditMode && (
          <p className="text-center text-wow-brown dark:text-gray-300 mt-2 mb-8">
            {t('apply_subheader')}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <FormSelect
            id="guildId"
            label={t('apply_select_guild')}
            value={formData.guildId}
            onChange={handleGuildChange}
            onBlur={handleBlur}
            error={touched.guildId ? formErrors.guildId : undefined}
            required
            disabled={isEditMode}
          >
            <option value="">{t('apply_selectGuild_placeholder')}</option>
            {availableGuilds.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </FormSelect>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              id="playerName"
              label={t('apply_playerName')}
              type="text"
              value={formData.playerName}
              onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
              onBlur={handleBlur}
              error={touched.playerName ? formErrors.playerName : undefined}
              required
            />
            <FormInput
              id="itemLevel"
              label={t('apply_itemLevel')}
              type="number"
              value={formData.itemLevel}
              onChange={(e) => setFormData({ ...formData, itemLevel: e.target.value })}
              onBlur={handleBlur}
              error={touched.itemLevel ? formErrors.itemLevel : undefined}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="flex items-end gap-4">
              <FormSelect
                id="wowClass"
                label={t('apply_class')}
                value={formData.wowClass}
                onChange={handleClassChange}
                onBlur={handleBlur}
                error={touched.wowClass ? formErrors.wowClass : undefined}
                required
              >
                <option value="">{t('apply_selectClass')}</option>
                {WOW_CLASSES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </FormSelect>
              {selectedClassData ? (
                <img
                  src={selectedClassData.icon}
                  alt={selectedClassData.name}
                  className="w-12 h-12 rounded-full border-2"
                  style={{ borderColor: selectedClassData.color }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-wow-gray-700 flex items-center justify-center text-gray-400 text-xl font-bold border-2 border-wow-gray-600">
                  ?
                </div>
              )}
            </div>
            <FormSelect
              id="wowSpec"
              label={t('apply_spec')}
              value={formData.wowSpec}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  wowSpec: e.target.value,
                  role: specs.find((s) => s.name === e.target.value)?.role || Role.DPS,
                })
              }
              onBlur={handleBlur}
              error={touched.wowSpec ? formErrors.wowSpec : undefined}
              disabled={!formData.wowClass}
              required
            >
              <option value="">{t('apply_selectSpec')}</option>
              {specs.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.role})
                </option>
              ))}
            </FormSelect>
          </div>

          <FormInput
            id="logsUrl"
            label={t('apply_logsUrl')}
            type="url"
            placeholder={t('apply_logsPlaceholder')}
            value={formData.logsUrl}
            onChange={(e) => setFormData({ ...formData, logsUrl: e.target.value })}
            onBlur={handleBlur}
            error={touched.logsUrl ? formErrors.logsUrl : undefined}
            required
          />

          <div>
            <label className="block text-sm text-wow-brown-light dark:text-wow-gold tracking-wider mb-2">
              {t('apply_raidExp')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/50 p-3 rounded-md border border-wow-brown-light dark:border-wow-gold-dark">
              {raidOptions.map((exp) => (
                <label
                  key={exp}
                  className="flex items-center space-x-2 text-wow-brown-dark dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    value={exp}
                    checked={formData.raidExperience.includes(exp)}
                    onChange={(e) => handleMultiSelectChange(e, 'raidExperience')}
                    className="h-4 w-4 rounded-sm border-gray-600 bg-gray-700 text-wow-blue focus:ring-wow-blue"
                  />
                  <span>{t(exp as keyof typeof t) || exp}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-wow-brown-light dark:text-wow-gold tracking-wider mb-2">
              {t('apply_availability')}
            </label>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/50 p-3 rounded-md border ${touched.availability && formErrors.availability ? 'border-red-500' : 'border-wow-brown-light dark:border-wow-gold-dark'}`}
            >
              {availabilityOptions.map((slot) => (
                <label
                  key={slot}
                  className="flex items-center space-x-2 text-wow-brown-dark dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    value={slot}
                    checked={formData.availability.includes(slot)}
                    onChange={(e) => handleMultiSelectChange(e, 'availability')}
                    className="h-4 w-4 rounded-sm border-gray-600 bg-gray-700 text-wow-blue focus:ring-wow-blue"
                  />
                  <span>{t(slot as keyof typeof t) || slot}</span>
                </label>
              ))}
            </div>
            {touched.availability && formErrors.availability && (
              <p className="text-red-400 text-xs mt-1">{formErrors.availability}</p>
            )}
          </div>

          <FormTextarea
            id="reason"
            label={t('apply_reason')}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            onBlur={handleBlur}
            error={touched.reason ? formErrors.reason : undefined}
            required
          />

          {customQuestions.length > 0 && (
            <div className="space-y-6 border-t border-wow-brown-light dark:border-wow-gold-dark pt-6 mt-6">
              <h3 className="text-xl font-bold text-wow-brown-dark dark:text-wow-gold tracking-wider">
                {t('apply_custom_questions_header')}
              </h3>
              {customQuestions.map((q) => (
                <FormInput
                  key={q.id}
                  id={`custom_${q.id}`}
                  label={q.label}
                  type="text"
                  value={formData.customAnswers[q.id] || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customAnswers: { ...prev.customAnswers, [q.id]: e.target.value },
                    }))
                  }
                  onBlur={handleBlur}
                  error={touched[`custom_${q.id}`] ? formErrors[`custom_${q.id}`] : undefined}
                  required
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <button type="submit" className="wow-button">
              {isEditMode ? t('apply_submit_edit') : t('apply_submit')}
            </button>
          </div>
        </form>
        {updateSuccess && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-800/90 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in border border-green-400">
            {t('apply_update_success')}
          </div>
        )}
      </div>
    </div>
  );
}
