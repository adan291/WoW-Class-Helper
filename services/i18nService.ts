/**
 * Internationalization Service
 * Manages multi-language support
 */

export type Language = 'en' | 'es' | 'fr' | 'de';

export interface Translation {
  [key: string]: string | Translation;
}

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
}

class I18nService {
  private readonly LANGUAGE_KEY = 'wow_class_helper_language';
  private currentLanguage: Language = 'en';

  private readonly LANGUAGES: Record<Language, LanguageConfig> = {
    en: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'HH:mm:ss',
    },
    es: {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm:ss',
    },
    fr: {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm:ss',
    },
    de: {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      direction: 'ltr',
      dateFormat: 'DD.MM.YYYY',
      timeFormat: 'HH:mm:ss',
    },
  };

  private translations: Record<Language, Translation> = {
    en: this.getEnglishTranslations(),
    es: this.getSpanishTranslations(),
    fr: this.getFrenchTranslations(),
    de: this.getGermanTranslations(),
  };

  constructor() {
    this.loadLanguage();
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Set language
   */
  setLanguage(language: Language): boolean {
    if (!this.LANGUAGES[language]) return false;

    this.currentLanguage = language;
    try {
      localStorage.setItem(this.LANGUAGE_KEY, language);
      document.documentElement.lang = language;
      document.documentElement.dir = this.LANGUAGES[language].direction;
    } catch {
      console.error('Failed to set language');
    }

    return true;
  }

  /**
   * Get translation
   */
  t(key: string, defaultValue?: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === 'string' ? value : defaultValue || key;
  }

  /**
   * Get translation with interpolation
   */
  tWithParams(key: string, params: Record<string, string | number>): string {
    let text = this.t(key);

    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{{${param}}}`, String(value));
    });

    return text;
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): LanguageConfig[] {
    return Object.values(this.LANGUAGES);
  }

  /**
   * Get language config
   */
  getLanguageConfig(language: Language): LanguageConfig | null {
    return this.LANGUAGES[language] || null;
  }

  /**
   * Format date
   */
  formatDate(date: Date | number, language?: Language): string {
    const lang = language || this.currentLanguage;
    const config = this.LANGUAGES[lang];

    if (!config) return new Date(date).toLocaleDateString();

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    if (config.dateFormat === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    } else if (config.dateFormat === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    } else if (config.dateFormat === 'DD.MM.YYYY') {
      return `${day}.${month}.${year}`;
    }

    return d.toLocaleDateString();
  }

  /**
   * Format time
   */
  formatTime(date: Date | number, language?: Language): string {
    const lang = language || this.currentLanguage;
    const d = new Date(date);

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format number
   */
  formatNumber(num: number, language?: Language): string {
    const lang = language || this.currentLanguage;
    return new Intl.NumberFormat(lang).format(num);
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency = 'USD', language?: Language): string {
    const lang = language || this.currentLanguage;
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Detect browser language
   */
  detectBrowserLanguage(): Language {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs: Language[] = ['en', 'es', 'fr', 'de'];

    if (supportedLangs.includes(browserLang as Language)) {
      return browserLang as Language;
    }

    return 'en';
  }

  /**
   * Get translation statistics
   */
  getTranslationStats(): {
    languages: number;
    keysPerLanguage: Record<Language, number>;
  } {
    const stats: Record<Language, number> = {} as Record<Language, number>;

    Object.entries(this.translations).forEach(([lang, trans]) => {
      stats[lang as Language] = this.countKeys(trans);
    });

    return {
      languages: Object.keys(this.LANGUAGES).length,
      keysPerLanguage: stats,
    };
  }

  // Private helper methods

  private loadLanguage(): void {
    try {
      const saved = localStorage.getItem(this.LANGUAGE_KEY);
      if (saved && this.LANGUAGES[saved as Language]) {
        this.currentLanguage = saved as Language;
      } else {
        this.currentLanguage = this.detectBrowserLanguage();
      }

      document.documentElement.lang = this.currentLanguage;
      document.documentElement.dir = this.LANGUAGES[this.currentLanguage].direction;
    } catch {
      this.currentLanguage = 'en';
    }
  }

  private countKeys(obj: any): number {
    let count = 0;

    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        count += this.countKeys(obj[key]);
      } else {
        count++;
      }
    }

    return count;
  }

  private getEnglishTranslations(): Translation {
    return {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
      },
      guides: {
        title: 'Guides',
        create: 'Create Guide',
        edit: 'Edit Guide',
        delete: 'Delete Guide',
        publish: 'Publish',
        unpublish: 'Unpublish',
      },
      classes: {
        warrior: 'Warrior',
        paladin: 'Paladin',
        hunter: 'Hunter',
        rogue: 'Rogue',
        priest: 'Priest',
        deathknight: 'Death Knight',
        shaman: 'Shaman',
        mage: 'Mage',
        warlock: 'Warlock',
        monk: 'Monk',
        druid: 'Druid',
        demonhunter: 'Demon Hunter',
        evoker: 'Evoker',
      },
    };
  }

  private getSpanishTranslations(): Translation {
    return {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        close: 'Cerrar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
      },
      guides: {
        title: 'Guías',
        create: 'Crear Guía',
        edit: 'Editar Guía',
        delete: 'Eliminar Guía',
        publish: 'Publicar',
        unpublish: 'Despublicar',
      },
      classes: {
        warrior: 'Guerrero',
        paladin: 'Paladín',
        hunter: 'Cazador',
        rogue: 'Pícaro',
        priest: 'Sacerdote',
        deathknight: 'Caballero de la Muerte',
        shaman: 'Chamán',
        mage: 'Mago',
        warlock: 'Brujo',
        monk: 'Monje',
        druid: 'Druida',
        demonhunter: 'Cazador de Demonios',
        evoker: 'Evocador',
      },
    };
  }

  private getFrenchTranslations(): Translation {
    return {
      common: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        close: 'Fermer',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
      },
      guides: {
        title: 'Guides',
        create: 'Créer un Guide',
        edit: 'Modifier le Guide',
        delete: 'Supprimer le Guide',
        publish: 'Publier',
        unpublish: 'Dépublier',
      },
      classes: {
        warrior: 'Guerrier',
        paladin: 'Paladin',
        hunter: 'Chasseur',
        rogue: 'Voleur',
        priest: 'Prêtre',
        deathknight: 'Chevalier de la Mort',
        shaman: 'Chaman',
        mage: 'Mage',
        warlock: 'Démoniste',
        monk: 'Moine',
        druid: 'Druide',
        demonhunter: 'Chasseur de Démons',
        evoker: 'Évocateur',
      },
    };
  }

  private getGermanTranslations(): Translation {
    return {
      common: {
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        close: 'Schließen',
        loading: 'Wird geladen...',
        error: 'Fehler',
        success: 'Erfolg',
      },
      guides: {
        title: 'Leitfäden',
        create: 'Leitfaden erstellen',
        edit: 'Leitfaden bearbeiten',
        delete: 'Leitfaden löschen',
        publish: 'Veröffentlichen',
        unpublish: 'Veröffentlichung aufheben',
      },
      classes: {
        warrior: 'Krieger',
        paladin: 'Paladin',
        hunter: 'Jäger',
        rogue: 'Schurke',
        priest: 'Priester',
        deathknight: 'Todesritter',
        shaman: 'Schamane',
        mage: 'Magier',
        warlock: 'Hexenmeister',
        monk: 'Mönch',
        druid: 'Druide',
        demonhunter: 'Dämonenjäger',
        evoker: 'Beschwörer',
      },
    };
  }
}

export const i18nService = new I18nService();
