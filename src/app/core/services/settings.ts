import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeEn from '@angular/common/locales/en';
import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type LanguageCode = 'en' | 'ar';

export interface AppLanguage {
  code: LanguageCode;
  labelKey: string;
  nativeName: string;
  locale: string;
  dir: 'ltr' | 'rtl';
}

registerLocaleData(localeEn, 'en');
registerLocaleData(localeAr, 'ar');

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private translate = inject(TranslateService);

  languages: AppLanguage[] = [
    { code: 'en', labelKey: 'English', nativeName: 'English', locale: 'en', dir: 'ltr' },
    { code: 'ar', labelKey: 'Arabic', nativeName: 'العربية', locale: 'ar', dir: 'rtl' },
  ];

  language = signal<LanguageCode>('en');
  locale = signal('en');
  isDarkMode = signal(false);

  constructor() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  setLanguage(lang: LanguageCode) {
    const selectedLanguage = this.languages.find((language) => language.code === lang);
    if (!selectedLanguage) return;

    this.language.set(lang);
    this.locale.set(selectedLanguage.locale);
    this.translate.use(lang);
    document.documentElement.dir = selectedLanguage.dir;
    document.documentElement.lang = lang;
  }

  toggleLanguage() {
    const newLang = this.language() === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  toggleTheme() {
    this.isDarkMode.update((value) => !value);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
