import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Application, ApplicationStatus, Role } from '../types';
import { WOW_CLASSES, RAID_EXPERIENCES, AVAILABILITY_SLOTS } from '../constants';

const ApplicantModal: React.FC<{
  applicant: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}> = ({ applicant, onClose, onStatusChange }) => {
  const { t } = useLanguage();
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const classData = WOW_CLASSES.find((c) => c.name === applicant.wowClass);
  const guild = context?.guilds.find((g) => g.id === applicant.guildId);

  const handleEdit = () => navigate(`/guild-manager/apply/${applicant.id}`);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="wow-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto font-cinzel" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-wow-brown-dark/20 dark:border-wow-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={classData?.icon} alt={applicant.wowClass} className="w-12 h-12 rounded-full border-2" style={{ borderColor: classData?.color }} />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: classData?.color }}>{applicant.playerName}</h2>
              <p className="text-wow-brown dark:text-gray-400">{applicant.wowSpec} {applicant.wowClass} - {applicant.itemLevel} ilvl</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4 text-wow-brown-dark dark:text-gray-300">
          <div><strong className="text-wow-brown-light dark:text-wow-gold">{t('modal_role')}:</strong> {applicant.role}</div>
          <div><strong className="text-wow-brown-light dark:text-wow-gold">{t('modal_logs')}:</strong> <a href={applicant.logsUrl} target="_blank" rel="noopener noreferrer" className="text-wow-blue hover:underline">{applicant.logsUrl}</a></div>
          <div><strong className="text-wow-brown-light dark:text-wow-gold">{t('modal_raidExp')}:</strong> <ul className="list-disc list-inside ml-4">{applicant.raidExperience.map((e) => <li key={e}>{t(e as keyof typeof t)}</li>)}</ul></div>
          <div><strong className="text-wow-brown-light dark:text-wow-gold">{t('modal_availability')}:</strong> <div className="flex flex-wrap gap-2 mt-1">{applicant.availability.map((d) => <span key={d} className="bg-wow-parchment-dark dark:bg-wow-gray-700 px-2 py-1 text-xs rounded">{t(d as keyof typeof t)}</span>)}</div></div>
          <div><strong className="text-wow-brown-light dark:text-wow-gold">{t('modal_reason')}:</strong><p className="bg-wow-parchment dark:bg-wow-gray-900 p-3 rounded-md mt-1 italic">"{applicant.reason}"</p></div>
          {guild?.customQuestions && guild.customQuestions.length > 0 && (
            <div className="border-t border-wow-brown-dark/20 dark:border-wow-gray-700 pt-4">
              <strong className="text-wow-brown-light dark:text-wow-gold mt-4 block">{t('admin_custom_questions_header')}</strong>
              {guild.customQuestions.map((q) => (
                <div key={q.id} className="mt-2">
                  <p className="font-semibold text-wow-brown dark:text-gray-400">{q.label}</p>
                  <p className="bg-wow-parchment dark:bg-wow-gray-900 p-3 rounded-md mt-1 italic">"{applicant.customAnswers?.[q.id] || t('admin_custom_questions_no_answer')}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 bg-wow-parchment-dark/50 dark:bg-wow-gray-900/50 flex justify-between items-center gap-3">
          <button onClick={handleEdit} className="wow-button !text-sm !py-2 !px-4">{t('modal_edit_button')}</button>
          <div className="flex items-center gap-3">
            <span className="text-wow-brown-dark dark:text-gray-400">{t('modal_status')}:</span>
            <select value={applicant.status} onChange={(e) => onStatusChange(applicant.id, e.target.value as ApplicationStatus)} className="wow-input">
              {Object.values(ApplicationStatus).map((s) => <option key={s} value={s}>{t(s as keyof typeof t)}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const context = useContext(AppContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [filters, setFilters] = useState({ class: '', role: '', status: '', raidExperience: '', availability: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'submissionDate', direction: 'desc' });

  useEffect(() => {
    if (!context?.authenticatedUser) navigate('/login');
  }, [context?.authenticatedUser, navigate]);

  const sortedAndFilteredApps = useMemo(() => {
    if (!context || !context.authenticatedUser) return [];
    let apps = context.applications
      .filter((app) => app.guildId === context.authenticatedUser?.guildId)
      .filter((app) => {
        return (
          (filters.class ? app.wowClass === filters.class : true) &&
          (filters.role ? app.role === filters.role : true) &&
          (filters.status ? app.status === filters.status : true) &&
          (filters.raidExperience ? app.raidExperience.includes(filters.raidExperience) : true) &&
          (filters.availability ? app.availability.includes(filters.availability) : true)
        );
      });
    apps.sort((a, b) => {
      if (sortConfig.key === 'playerName') {
        return sortConfig.direction === 'asc' ? a.playerName.localeCompare(b.playerName) : b.playerName.localeCompare(a.playerName);
      }
      return sortConfig.direction === 'asc' ? a.submissionDate.getTime() - b.submissionDate.getTime() : b.submissionDate.getTime() - a.submissionDate.getTime();
    });
    return apps;
  }, [context, filters, sortConfig]);

  if (!context || !context.authenticatedUser) return null;

  const getStatusIndicatorClass = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACCEPTED: return 'bg-green-500';
      case ApplicationStatus.REJECTED: return 'bg-red-500';
      default: return 'bg-yellow-500 animate-pulse-slow';
    }
  };

  const handleSortChange = (value: string) => {
    const [key, direction] = value.split('_');
    setSortConfig({ key, direction });
  };

  return (
    <div className="font-cinzel">
      {selectedApplicant && <ApplicantModal applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} onStatusChange={context.updateApplicationStatus} />}
      <div className="wow-panel">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-wow-brown-dark dark:text-wow-gold tracking-wider">{context.authenticatedUser.guildName} {t('admin_dashboard_header')}</h1>
        </div>
        <div className="my-6 p-4 bg-wow-parchment-dark/50 dark:bg-wow-gray-900/50 rounded-md border border-wow-brown-light/50 dark:border-wow-gray-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select onChange={(e) => setFilters({ ...filters, class: e.target.value })} className="wow-input w-full">
              <option value="">{t('admin_filter_allClasses')}</option>
              {WOW_CLASSES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, role: e.target.value })} className="wow-input w-full">
              <option value="">{t('admin_filter_allRoles')}</option>
              {Object.values(Role).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="wow-input w-full">
              <option value="">{t('admin_filter_allStatuses')}</option>
              {Object.values(ApplicationStatus).map((s) => <option key={s} value={s}>{t(s as keyof typeof t)}</option>)}
            </select>
            <select onChange={(e) => handleSortChange(e.target.value)} defaultValue="submissionDate_desc" className="wow-input w-full">
              <option value="submissionDate_desc">{t('admin_sort_date_new')}</option>
              <option value="submissionDate_asc">{t('admin_sort_date_old')}</option>
              <option value="playerName_asc">{t('admin_sort_name')}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <select onChange={(e) => setFilters({ ...filters, raidExperience: e.target.value })} className="wow-input w-full">
              <option value="">All Raid Experience</option>
              {RAID_EXPERIENCES.map((exp) => <option key={exp} value={exp}>{t(exp as keyof typeof t)}</option>)}
            </select>
            <select onChange={(e) => setFilters({ ...filters, availability: e.target.value })} className="wow-input w-full">
              <option value="">All Availability</option>
              {AVAILABILITY_SLOTS.map((slot) => <option key={slot} value={slot}>{t(slot as keyof typeof t)}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-wow-parchment-dark dark:bg-wow-gray-900 text-wow-brown-dark dark:text-wow-gold uppercase tracking-wider text-sm">
              <tr>
                <th className="p-3">{t('admin_table_player')}</th>
                <th className="p-3 hidden md:table-cell">{t('admin_table_class')}</th>
                <th className="p-3">{t('admin_table_role')}</th>
                <th className="p-3 hidden md:table-cell">{t('admin_table_ilvl')}</th>
                <th className="p-3">{t('admin_table_status')}</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredApps.map((app) => {
                const classData = WOW_CLASSES.find((c) => c.name === app.wowClass);
                return (
                  <tr key={app.id} className={`border-b border-wow-brown-dark/20 dark:border-wow-gray-700 hover:bg-wow-parchment-dark dark:hover:bg-wow-gray-700/50 transition-all duration-200 hover:scale-[1.01] ${app.isNew ? 'bg-wow-blue/10' : ''}`}>
                    <td className="p-3 font-bold">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getStatusIndicatorClass(app.status)}`}></span>
                        <span style={{ color: classData?.color }}>{app.playerName}</span>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell" style={{ color: classData?.color }}>{app.wowSpec} {app.wowClass}</td>
                    <td className="p-3">{app.role}</td>
                    <td className="p-3 hidden md:table-cell">{app.itemLevel}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${app.status === ApplicationStatus.ACCEPTED ? 'bg-green-500/20 text-green-300' : app.status === ApplicationStatus.REJECTED ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{t(app.status as keyof typeof t)}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => setSelectedApplicant(app)} className="wow-button !text-xs !py-1 !px-3">{t('admin_table_view')}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedAndFilteredApps.length === 0 && <p className="text-center text-wow-brown-dark dark:text-gray-400 py-8">{t('admin_no_results')}</p>}
        </div>
      </div>
    </div>
  );
}
