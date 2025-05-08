import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideClientHydration, withEventReplay, withI18nSupport} from '@angular/platform-browser';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideAnimations} from '@angular/platform-browser/animations';
import {GalleryModule} from 'ng-gallery';
import {localizedApiInterceptor} from './core/interceptors/language.interceptor';
import {API_PREFIX} from './core/tokens/API_PREFIX';
import {Url} from './core/constants/base-url';
import {DatePipe} from '@angular/common';

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (http: HttpClient) =>
  new TranslateHttpLoader(http, './i18n/', '.json');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay(),withI18nSupport()),
    provideAnimations(),
    provideAnimationsAsync(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      GalleryModule
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([localizedApiInterceptor])
    ),
    {
      provide: API_PREFIX,
      useValue: Url.baseUrl // **Configure your API prefix here!**
    },
    DatePipe
  ]
};
