import {InjectionToken} from '@angular/core';
import {Url} from '../constants/base-url';


export const API_PREFIX = new InjectionToken<string>(Url.baseUrl);
