import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private platformId = inject(PLATFORM_ID);

  constructor(private translateService: TranslateService) {}

  // Get the saved language from cookies
  getSavedLanguage(): string {
    if (isPlatformBrowser(this.platformId)) {
      return this.getCookie('lang') || 'en'; // Default to 'en'
    }
    return 'en'; // Default if running on the server
  }

  // Save the language to cookies
  saveLanguage(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.cookie = `lang=${lang}; path=/; max-age=31536000`; // 1 year expiration
    }
  }

  // Apply the saved language
  applySavedLanguage(): void {
    const savedLang = this.getSavedLanguage();
    this.translateService.use(savedLang);
  }

  // Helper function to get a cookie value
  private getCookie(name: string): string | null {
    const matches = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return matches ? decodeURIComponent(matches[2]) : null;
  }
}
