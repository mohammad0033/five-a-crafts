import {HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {API_PREFIX} from '../tokens/API_PREFIX';


export const localizedApiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const injector = inject(Injector);

  // Delay TranslateService resolution
  let translateService: TranslateService | null = null;
  try {
    translateService = injector.get(TranslateService);
  } catch (e) {
    // console.warn('TranslateService not available yet, skipping language prefix injection.');
    return next(req); // If TranslateService isn't available, avoid breaking the app
  }

  const apiPrefix = inject(API_PREFIX);
  const currentLang = translateService?.currentLang || 'en'; // Ensure fallback if undefined
  const supportedLangs = translateService?.getLangs() || ['en'];

  // console.log('Current language:', currentLang);
  // console.log('API prefix:', apiPrefix);

  if (!req.url.startsWith(apiPrefix)) {
    return next(req); // Not an API call, proceed
  }

  const urlSegments = req.url.substring(apiPrefix.length).split('/');
  // console.log(urlSegments)
  const hasLangPrefix = urlSegments.length > 0 && supportedLangs.includes(urlSegments[0]);

  if (hasLangPrefix) {
    return next(req); // Already localized
  }

  // console.log(req.url.substring(apiPrefix.length))
  const localizedUrl = `${apiPrefix}/${currentLang}${req.url.substring(apiPrefix.length)}`;

  const localizedRequest = req.clone({
    url: localizedUrl,
  });

  // console.log('Modified URL:', localizedUrl);

  return next(localizedRequest);
};
