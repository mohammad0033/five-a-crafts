import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes'; // Defines the application's routes
// --- Platform Browser Providers ---
import {provideClientHydration, withEventReplay, withI18nSupport} from '@angular/platform-browser';
// --- Internationalization (i18n) with ngx-translate ---
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
// --- HTTP Client ---
import {HttpClient, provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
// --- Animations ---
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async'; // For lazy loading animations
import {provideAnimations} from '@angular/platform-browser/animations'; // For eager loading animations
// --- Third-party Modules ---
import {GalleryModule} from 'ng-gallery'; // For image gallery functionality
// --- Custom Interceptors and Tokens ---
import {localizedApiInterceptor} from './core/interceptors/language.interceptor'; // Interceptor to add language to API requests
import {API_PREFIX} from './core/tokens/API_PREFIX'; // Token for the base URL of your API
import {Url} from './core/constants/base-url'; // Contains the actual base URL string
// --- Utility Pipes ---
import {DatePipe} from '@angular/common'; // Angular's built-in DatePipe

// Factory function for creating TranslateHttpLoader
// This loader fetches translation files (e.g., en.json, ar.json) from the specified path.
const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './i18n/', '.json'); // Path to translation files and their extension

// Application configuration object
export const appConfig: ApplicationConfig = {
  providers: [
    // Configures Zone.js change detection with event coalescing for performance.
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Sets up the Angular Router with the defined application routes.
    provideRouter(routes),
    // Enables client-side hydration to smoothly transition from SSR to CSR.
    // `withEventReplay()`: Replays user events that occurred before the app was fully hydrated.
    // `withI18nSupport()`: Provides necessary support for i18n features during hydration.
    provideClientHydration(withEventReplay(), withI18nSupport()),
    // Provides support for Angular animations (eagerly).
    provideAnimations(),
    // Provides support for Angular animations (asynchronously/lazily).
    provideAnimationsAsync(),
    // Imports providers from existing Angular Modules (`@NgModule`).
    // Useful for integrating libraries that are still based on NgModules.
    importProvidersFrom(
      TranslateModule.forRoot({ // Configures ngx-translate at the root level.
        defaultLanguage: 'en', // Sets the default language if no other language is detected.
        loader: { // Configures how translation files are loaded.
          provide: TranslateLoader, // Token for the translation loader.
          useFactory: httpLoaderFactory, // Uses the custom factory to create the loader.
          deps: [HttpClient] // Dependencies required by the factory (HttpClient in this case).
        }
      }),
      GalleryModule // Provides services and components from ng-gallery.
    ),
    // Configures the HttpClient.
    provideHttpClient(
      withFetch(), // Enables the use of the `fetch` API for HTTP requests (modern approach).
      withInterceptors([localizedApiInterceptor]) // Registers custom HTTP interceptors.
    ),
    // Provides the API base URL using a custom token.
    {
      provide: API_PREFIX, // Token representing the API prefix.
      useValue: Url.baseUrl // The actual base URL string. **Configure your API prefix here!**
    },
    // Provides the DatePipe for formatting dates throughout the application.
    DatePipe
  ]
};
