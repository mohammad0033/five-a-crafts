import {Component, inject, Inject, OnInit, Optional, PLATFORM_ID, Renderer2} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core'; // ngx-translate for internationalization
import {DOCUMENT, isPlatformBrowser} from '@angular/common'; // DOCUMENT token and platform check
import {INITIAL_LANG} from './core/tokens/initial-lang.token'; // Token for language passed from server
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy'; // Utility for automatic unsubscription

@UntilDestroy() // Decorator from @ngneat/until-destroy to automatically unsubscribe observables when the component is destroyed
@Component({
  selector: 'app-root', // The HTML tag used to embed this component
  imports: [RouterOutlet, TranslateModule], // Modules/components imported by this standalone component
  templateUrl: './app.component.html', // Path to the HTML template
  standalone: true, // Marks this component as a standalone component (new Angular feature)
  styleUrl: './app.component.scss' // Path to the component-specific styles
})
export class AppComponent implements OnInit {
  title = 'five-a-crafts'; // A simple property, often used for the application title
  private readonly langCookieName = 'five-a-crafts-lang'; // Name of the cookie used to store language preference
  // private langChangeSubscription!: Subscription; // Subscription to language changes (now handled by @untilDestroyed)
  private document = inject(DOCUMENT); // Injects the global DOCUMENT object for DOM manipulation

  constructor(
    private translate: TranslateService, // Service for handling translations
    @Inject(PLATFORM_ID) private platformId: Object, // Token to identify if running on browser or server
    private renderer: Renderer2, // Service for DOM manipulation, safer than direct access
    // Injects the initial language determined by the server.
    // `@Optional()` means it's not an error if this token isn't provided (e.g., during pure client-side rendering without SSR).
    @Optional() @Inject(INITIAL_LANG) private initialLangFromServer: string | null
  ) {
    // Determine the language to use when the application starts.
    // This considers server-provided language, cookies, and defaults.
    const resolvedInitialLang = this.determineInitialLanguage();

    // Set the default language for ngx-translate. This is a fallback.
    this.translate.setDefaultLang('en');
    // Set the active language for ngx-translate.
    // On the server, this will use `initialLangFromServer`.
    // On the client, it prioritizes cookie, then `initialLangFromServer` (transferred via hydration), then default.
    this.translate.use(resolvedInitialLang);

    // Note on DOM manipulation:
    // Setting `lang` and `dir` attributes on the `<html>` tag for the *initial* server response
    // is handled in `server.ts`. This ensures the very first HTML sent to the browser is correct.
    // The `applyLanguageDOMChanges` method here will run on the client after hydration
    // to ensure consistency and handle subsequent language changes.
  }

  ngOnInit() {
    // Code here runs after the component is initialized.
    // We only want to perform browser-specific operations (like DOM manipulation or cookie handling)
    // if the code is running in a browser environment.
    if (isPlatformBrowser(this.platformId)) {
      // Apply initial DOM changes (like lang, dir, body classes) based on the language
      // that ngx-translate has resolved to in the constructor.
      // `this.translate.currentLang` should reflect the language set by `translate.use()`.
      this.applyLanguageDOMChanges(this.translate.currentLang || this.translate.defaultLang);

      // Subscribe to language change events from ngx-translate.
      // When the language changes (e.g., user selects a new language),
      // update the DOM and save the new preference to a cookie.
      // `untilDestroyed(this)` ensures this subscription is automatically cleaned up
      // when the component is destroyed, preventing memory leaks.
      this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(event => {
        this.applyLanguageDOMChanges(event.lang); // Update DOM attributes (html lang, dir, body class)
        this.saveLanguageToCookie(event.lang); // Save the new language preference in a cookie
      });
    }
  }

  // Determines the initial language for the application.
  // Priority:
  // 1. Server-Side: Use language passed from `server.ts` via `INITIAL_LANG` token.
  // 2. Client-Side (after hydration or initial load):
  //    a. Language from cookie.
  //    b. Language from `initialLangFromServer` (if available from SSR state transfer).
  // 3. Fallback: Default language (e.g., 'en').
  private determineInitialLanguage(): string {
    // 1. On Server: If `initialLangFromServer` is provided (by server.ts), use it.
    //    This ensures SSR uses the language detected by the server.
    if (this.initialLangFromServer && !isPlatformBrowser(this.platformId)) {
      return this.initialLangFromServer;
    }

    // 2. On Client: Try to get language from the cookie first.
    //    This allows user's persisted preference to override other client-side defaults.
    if (isPlatformBrowser(this.platformId)) {
      const cookieValue = this.getLanguageFromCookie();
      if (cookieValue) {
        return cookieValue;
      }
    }

    // 3. On Client: If no cookie, but `initialLangFromServer` is available (transferred from server via hydration), use it.
    //    This is important for the first client-side render after SSR if the server detected a non-default language
    //    and no cookie was previously set.
    if (this.initialLangFromServer) { // This check can be true on client if value was transferred
      return this.initialLangFromServer;
    }

    // 4. Absolute fallback if no other language source is found.
    return this.translate.defaultLang || 'en'; // Use ngx-translate's default or 'en'
  }

  // Retrieves the language preference from the browser's cookies.
  private getLanguageFromCookie(): string | null {
    if (isPlatformBrowser(this.platformId)) { // Only attempt to access cookies in the browser
      // Regex to find the specific language cookie.
      // `encodeURIComponent` handles special characters in cookie names.
      // `replace(/[\-\.\+\*]/g, "\\$&")` escapes regex special characters in the cookie name.
      const cookieRegex = new RegExp(`(?:^|;\\s*)${encodeURIComponent(this.langCookieName).replace(/[\-\.\+\*]/g, "\\$&")}=([^;]*)`);
      const matches = this.document.cookie.match(cookieRegex);
      return matches ? decodeURIComponent(matches[1]) : null; // Return decoded cookie value or null if not found
    }
    return null; // Return null if not in a browser environment
  }

  // Saves the selected language to a browser cookie.
  private saveLanguageToCookie(lang: string): void {
    if (isPlatformBrowser(this.platformId)) { // Only attempt to set cookies in the browser
      // Determine if the cookie should be marked as 'Secure' (only sent over HTTPS)
      const secureCookie = this.document.location.protocol === 'https:';
      // Set the cookie:
      // - `path=/`: Makes the cookie available across the entire site.
      // - `max-age=31536000`: Sets expiration to 1 year (in seconds).
      // - `SameSite=Lax`: Provides some CSRF protection.
      // - `Secure`: (if applicable) Ensures cookie is only sent over HTTPS.
      this.document.cookie = `${this.langCookieName}=${encodeURIComponent(lang)}; path=/; max-age=31536000; SameSite=Lax${secureCookie ? '; Secure' : ''}`;
    }
  }

  // Applies language-specific changes to the DOM (e.g., `lang`, `dir` attributes, body classes).
  // This method is intended to run only in the browser.
  private applyLanguageDOMChanges(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      // Determine text direction based on the language.
      const direction = lang === 'ar' ? 'rtl' : 'ltr';

      // Set 'lang' and 'dir' attributes on the root <html> element.
      // This is important for accessibility and browser behavior.
      this.renderer.setAttribute(this.document.documentElement, 'lang', lang);
      this.renderer.setAttribute(this.document.documentElement, 'dir', direction);

      // Optionally, manage language-specific classes on the <body> element for styling.
      // Remove any existing language classes to prevent conflicts.
      this.renderer.removeClass(this.document.body, 'en');
      this.renderer.removeClass(this.document.body, 'ar');
      // Add the class for the current language.
      this.renderer.addClass(this.document.body, lang);
    }
  }
}
