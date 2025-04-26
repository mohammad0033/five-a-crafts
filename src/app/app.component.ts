import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'five-a-crafts';
  constructor(private translate: TranslateService,
              @Inject(PLATFORM_ID) private platformId: Object) {
    // Get saved language from cookies
    const savedLang = this.getSavedLanguage();

    // Set the default language and initialize translation
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.translate.onLangChange.subscribe(event => {
        document?.body?.classList.toggle('ar', event.lang === 'ar');
        this.saveLanguage(event.lang); // Save language when changed
      });
    }
  }

  // Function to get the saved language from cookies
  private getSavedLanguage(): string {
    if (isPlatformBrowser(this.platformId)) {
      const matches = document.cookie.match(/(^| )lang=([^;]+)/);
      return matches ? decodeURIComponent(matches[2]) : 'en'; // Default to 'en'
    }
    return 'en'; // Default if running on the server
  }

  // Function to save the selected language in cookies
  private saveLanguage(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.cookie = `lang=${lang}; path=/; max-age=31536000`; // 1-year expiration
    }
  }
}
