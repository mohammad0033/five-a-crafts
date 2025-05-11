import { InjectionToken } from '@angular/core';

// Token to provide the absolute path to the browser distribution's assets folder on the server
// This path will be where the 'i18n' folder (copied from 'public/i18n') resides after the build.
export const SERVER_ASSETS_PATH = new InjectionToken<string>('SERVER_ASSETS_PATH');
